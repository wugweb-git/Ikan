<?php
/**
 * Hostinger High-Stability Mail Integration & SDK Wrapper
 *
 * Implements Hostinger Mail API PHP SDK (hostinger/mail-api-php-sdk)
 * and hardened PHPMailer SMTP transport for iKAN Health (ikanhealth.in).
 *
 * Incoming: imap.hostinger.com (Port 993, SSL)
 * Outgoing: smtp.hostinger.com (Port 465, SSL / SMTPS)
 *
 * DKIM: hostingermail1._domainkey
 *
 * @package iKAN_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

// 1. Autoload Composer dependencies (Hostinger Mail API SDK & Guzzle)
$ikan_composer_autoload = get_template_directory() . '/vendor/autoload.php';
if ( file_exists( $ikan_composer_autoload ) ) {
  require_once $ikan_composer_autoload;
}

class Ikan_Hostinger_Mail {

  const HOST = 'smtp.hostinger.com';
  const PORT_SSL = 465;
  const PORT_TLS = 587;
  const DEFAULT_FROM_EMAIL = 'noreply@ikanhealth.in';
  const DEFAULT_FROM_NAME  = 'iKAN Health';

  /**
   * Bootstraps mail hooks
   */
  public static function init() {
    add_action( 'phpmailer_init', [ __CLASS__, 'configure_phpmailer' ], 10, 1 );
    add_filter( 'wp_mail_from', [ __CLASS__, 'filter_from_email' ], 10, 1 );
    add_filter( 'wp_mail_from_name', [ __CLASS__, 'filter_from_name' ], 10, 1 );
    add_action( 'wp_mail_failed', [ __CLASS__, 'log_mail_failure' ], 10, 1 );

    // Register WP-CLI test command if running inside WP-CLI
    if ( defined( 'WP_CLI' ) && WP_CLI ) {
      WP_CLI::add_command( 'ikan-mail', [ __CLASS__, 'cli_handler' ] );
    }
  }

  /**
   * Configures PHPMailer to use Hostinger SMTP with robust socket keepalive and timeout
   *
   * @param PHPMailer\PHPMailer\PHPMailer $phpmailer
   */
  public static function configure_phpmailer( $phpmailer ) {
    $username = self::get_smtp_user();
    $password = self::get_smtp_pass();

    // If no credentials configured yet, allow default mailer to handle
    if ( empty( $username ) || empty( $password ) ) {
      return;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host       = self::HOST;
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = $username;
    $phpmailer->Password   = $password;

    // Preferred SSL on Port 465, fallback to TLS on Port 587
    $port = (int) ( defined( 'HOSTINGER_SMTP_PORT' ) ? HOSTINGER_SMTP_PORT : 465 );
    $phpmailer->Port = $port;

    if ( 465 === $port ) {
      $phpmailer->SMTPSecure = 'ssl';
    } else {
      $phpmailer->SMTPSecure = 'tls';
    }

    // High stability parameters: connection keepalive and generous 30s timeout
    $phpmailer->Timeout       = 30;
    $phpmailer->SMTPKeepAlive = true;

    // Secure TLS stream context options
    $phpmailer->SMTPOptions = [
      'ssl' => [
        'verify_peer'       => true,
        'verify_peer_name'  => true,
        'allow_self_signed' => false,
      ],
    ];

    // Ensure From header is valid
    if ( empty( $phpmailer->From ) || 'wordpress@' === substr( $phpmailer->From, 0, 10 ) ) {
      $phpmailer->From     = $username;
      $phpmailer->FromName = self::DEFAULT_FROM_NAME;
    }
  }

  /**
   * Filters the From email address
   */
  public static function filter_from_email( $original ) {
    $user = self::get_smtp_user();
    if ( ! empty( $user ) ) {
      return $user;
    }
    return ! empty( $original ) && 'wordpress@' !== substr( $original, 0, 10 ) ? $original : self::DEFAULT_FROM_EMAIL;
  }

  /**
   * Filters the From name
   */
  public static function filter_from_name( $original ) {
    if ( empty( $original ) || 'WordPress' === $original ) {
      return self::DEFAULT_FROM_NAME;
    }
    return $original;
  }

  /**
   * Logs mail failure diagnostics
   *
   * @param WP_Error $error
   */
  public static function log_mail_failure( $error ) {
    $message = is_wp_error( $error ) ? $error->get_error_message() : 'Unknown error';
    $data    = is_wp_error( $error ) ? $error->get_error_data() : [];
    
    // Log to WordPress debug log
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
      error_log( sprintf( '[iKAN Hostinger Mail Error] %s | Data: %s', $message, json_encode( $data ) ) );
    }

    // Store last failure transient for admin diagnostics
    set_transient( 'ikan_last_mail_error', [
      'time'    => current_time( 'mysql' ),
      'message' => $message,
      'data'    => $data,
    ], DAY_IN_SECONDS );
  }

  /**
   * Get SMTP Username from constant or option
   */
  public static function get_smtp_user() {
    if ( defined( 'HOSTINGER_SMTP_USER' ) && ! empty( HOSTINGER_SMTP_USER ) ) {
      return HOSTINGER_SMTP_USER;
    }
    $opt = get_option( 'hostinger_smtp_user' );
    if ( ! empty( $opt ) ) {
      return $opt;
    }
    // Check WordPress SMTP plugin settings if configured
    $smtp_settings = get_option( 'smtp_settings' );
    if ( is_array( $smtp_settings ) && ! empty( $smtp_settings['username'] ) ) {
      return $smtp_settings['username'];
    }
    return self::DEFAULT_FROM_EMAIL;
  }

  /**
   * Get SMTP Password from constant or option
   */
  public static function get_smtp_pass() {
    if ( defined( 'HOSTINGER_SMTP_PASS' ) && ! empty( HOSTINGER_SMTP_PASS ) ) {
      return HOSTINGER_SMTP_PASS;
    }
    $opt = get_option( 'hostinger_smtp_pass' );
    if ( ! empty( $opt ) ) {
      return $opt;
    }
    // Check FluentSMTP connection settings
    if ( function_exists( 'fluentMailGetSettings' ) ) {
      try {
        $fm_settings = fluentMailGetSettings();
        if ( ! empty( $fm_settings['connections'] ) ) {
          foreach ( $fm_settings['connections'] as $conn ) {
            if ( ! empty( $conn['provider_settings']['password'] ) ) {
              return $conn['provider_settings']['password'];
            }
          }
        }
      } catch ( Throwable $e ) {}
    }
    // Check WordPress SMTP plugin credentials
    if ( class_exists( 'WordPress\SMTP\Credentials' ) ) {
      try {
        $creds = new WordPress\SMTP\Credentials();
        $pass = $creds->get_password();
        if ( ! empty( $pass ) ) {
          return $pass;
        }
      } catch ( Throwable $e ) {}
    }
    return '';
  }

  /**
   * Check if Hostinger Mail REST API SDK is configured and ready
   *
   * @return bool
   */
  public static function is_api_available() {
    $token = self::get_api_token();
    return ! empty( $token ) && class_exists( 'Hostinger\Configuration' ) && class_exists( 'Hostinger\Api\SendApi' );
  }

  /**
   * Retrieve Hostinger Mail API Token
   *
   * @return string
   */
  public static function get_api_token() {
    if ( defined( 'HOSTINGER_MAIL_API_TOKEN' ) && ! empty( HOSTINGER_MAIL_API_TOKEN ) ) {
      return HOSTINGER_MAIL_API_TOKEN;
    }
    if ( defined( 'AW_HOSTINGER_MAIL_TOKEN' ) && ! empty( AW_HOSTINGER_MAIL_TOKEN ) ) {
      return AW_HOSTINGER_MAIL_TOKEN;
    }
    return (string) get_option( 'hostinger_mail_api_token', '' );
  }

  /**
   * Initialize Hostinger Mail API SDK SendApi client
   *
   * @return Hostinger\Api\SendApi|null
   */
  public static function get_send_api() {
    $token = self::get_api_token();
    if ( empty( $token ) || ! class_exists( 'Hostinger\Configuration' ) || ! class_exists( 'Hostinger\Api\SendApi' ) ) {
      return null;
    }
    $config = Hostinger\Configuration::getDefaultConfiguration()->setAccessToken( $token );
    return new Hostinger\Api\SendApi(
      client: new GuzzleHttp\Client(),
      config: $config
    );
  }

  /**
   * Initialize Hostinger Mail API SDK AccountApi client
   *
   * @return Hostinger\Api\AccountApi|null
   */
  public static function get_account_api() {
    $token = self::get_api_token();
    if ( empty( $token ) || ! class_exists( 'Hostinger\Configuration' ) || ! class_exists( 'Hostinger\Api\AccountApi' ) ) {
      return null;
    }
    $config = Hostinger\Configuration::getDefaultConfiguration()->setAccessToken( $token );
    return new Hostinger\Api\AccountApi(
      client: new GuzzleHttp\Client(),
      config: $config
    );
  }

  /**
   * Initialize Hostinger Mail API SDK QuotaApi client
   *
   * @return Hostinger\Api\QuotaApi|null
   */
  public static function get_quota_api() {
    $token = self::get_api_token();
    if ( empty( $token ) || ! class_exists( 'Hostinger\Configuration' ) || ! class_exists( 'Hostinger\Api\QuotaApi' ) ) {
      return null;
    }
    $config = Hostinger\Configuration::getDefaultConfiguration()->setAccessToken( $token );
    return new Hostinger\Api\QuotaApi(
      client: new GuzzleHttp\Client(),
      config: $config
    );
  }

  /**
   * Dispatch high-speed transactional email via Hostinger Mail REST API SDK
   *
   * @param string $to
   * @param string $subject
   * @param string $html_body
   * @param array  $attachments
   * @param string $from_name
   * @param string $reply_to
   * @return bool|WP_Error
   */
  public static function send_via_api( $to, $subject, $html_body, $attachments = [], $from_name = self::DEFAULT_FROM_NAME, $reply_to = 'support@ikanhealth.in' ) {
    $send_api = self::get_send_api();
    if ( ! $send_api ) {
      return new WP_Error( 'hostinger_api_missing', 'Hostinger Mail API SDK or API Token not configured.' );
    }

    try {
      $mailbox_id = defined( 'HOSTINGER_MAILBOX_ID' ) ? HOSTINGER_MAILBOX_ID : get_option( 'hostinger_mailbox_id', self::DEFAULT_FROM_EMAIL );
      $request = new Hostinger\Model\V1SendRequest();
      $request->setSubject( $subject );
      $request->setBody( $html_body );
      $request->setTo( [ $to ] );
      $request->setFromName( $from_name );
      $request->setReplyTo( [ $reply_to ] );

      $result = $send_api->sendEmail( $mailbox_id, $request );
      return true;
    } catch ( Throwable $e ) {
      self::log_mail_failure( new WP_Error( 'hostinger_api_error', $e->getMessage() ) );
      return new WP_Error( 'hostinger_api_error', $e->getMessage() );
    }
  }

  /**
   * Backwards compatible alias for get_send_api
   *
   * @return Hostinger\Api\SendApi|null
   */
  public static function get_api_client() {
    return self::get_send_api();
  }

  /**
   * WP-CLI command handler for testing and diagnostics
   *
   * @param array $args
   * @param array $assoc_args
   */
  public static function cli_handler( $args, $assoc_args ) {
    $action = $args[0] ?? 'status';

    switch ( $action ) {
      case 'status':
        WP_CLI::line( '=== iKAN Hostinger Mail Integration Status ===' );
        WP_CLI::line( 'Host:            ' . self::HOST );
        WP_CLI::line( 'Port:            ' . ( defined( 'HOSTINGER_SMTP_PORT' ) ? HOSTINGER_SMTP_PORT : self::PORT_SSL ) );
        WP_CLI::line( 'User:            ' . self::get_smtp_user() );
        WP_CLI::line( 'Password Set:    ' . ( empty( self::get_smtp_pass() ) ? 'No' : 'Yes' ) );
        WP_CLI::line( 'SDK Installed:   ' . ( class_exists( 'Hostinger\Configuration' ) ? 'Yes (hostinger/mail-api-php-sdk)' : 'No' ) );
        $token = self::get_api_token();
        WP_CLI::line( 'API Token:       ' . ( empty( $token ) ? 'Not configured (SMTP active)' : 'Configured (' . substr( $token, 0, 8 ) . '...)' ) );
        WP_CLI::line( 'API Ready:       ' . ( self::is_api_available() ? 'Yes' : 'No (Awaiting API token)' ) );
        WP_CLI::line( 'DKIM Selector:   hostingermail1._domainkey' );
        break;

      case 'test':
        $to = $args[1] ?? get_option( 'admin_email' );
        WP_CLI::line( "Sending test email via Hostinger infrastructure to: {$to}..." );
        $subject = 'iKAN Health — Hostinger Mail Test (' . current_time( 'Y-m-d H:i:s' ) . ')';
        $message = "This is a diagnostic verification email sent via Hostinger Mail Infrastructure for ikanhealth.in.\n\nOutgoing SMTP: smtp.hostinger.com:465 (SSL)\nDKIM: hostingermail1._domainkey\nAutoloader: Active";
        $sent = wp_mail( $to, $subject, $message );
        if ( $sent ) {
          WP_CLI::success( "Email successfully dispatched to {$to}!" );
        } else {
          $err = get_transient( 'ikan_last_mail_error' );
          $err_msg = is_array( $err ) ? $err['message'] : 'Check wp_mail_failed logs';
          WP_CLI::error( "Failed to dispatch email: {$err_msg}" );
        }
        break;

      case 'api-test':
        $to = $args[1] ?? get_option( 'admin_email' );
        WP_CLI::line( "Testing dispatch via Hostinger REST API SDK to: {$to}..." );
        $subject = 'iKAN Health — Hostinger API SDK Test (' . current_time( 'Y-m-d H:i:s' ) . ')';
        $body = '<p>This test email was dispatched via the <strong>Hostinger Mail API PHP SDK</strong> client directly over HTTPS.</p>';
        $res = self::send_via_api( $to, $subject, $body );
        if ( is_wp_error( $res ) ) {
          WP_CLI::error( "API dispatch failed: " . $res->get_error_message() );
        } else {
          WP_CLI::success( "Email dispatched via Hostinger REST API SDK to {$to}!" );
        }
        break;

      default:
        WP_CLI::line( "Usage: wp ikan-mail [status|test <email>|api-test <email>]" );
    }
  }
}

// Initialize on WordPress load
Ikan_Hostinger_Mail::init();
