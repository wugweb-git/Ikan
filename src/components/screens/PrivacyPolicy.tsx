import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Icon } from '../Icon';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface PrivacyPolicyProps {
  className?: string;
  onBack?: () => void;
}

export function PrivacyPolicy({ className, onBack }: PrivacyPolicyProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`min-h-screen ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-bg-page)',
        fontFamily: 'var(--font-family-base)'
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-default) 0%, #1a1a1a 100%)',
          color: 'var(--color-text-inverse)',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)'
        }}
      >
        <div 
          className="w-full mx-auto"
          style={{
            maxWidth: 'var(--constraint-content-max)'
          }}
        >
          {/* Back Navigation */}
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-6"
              style={{
                height: '48px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '0 var(--spacing-3)'
              }}
            >
              <Icon name="arrow-left" size={16} className="mr-2" />
              Back
            </Button>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center mb-6">
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--ikan-component-spacing-default)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Icon name="shield-check" size={32} style={{ color: 'var(--color-text-inverse)' }} />
              </div>
            </div>
            
            <h1 
              style={{
                fontSize: isMobile ? 'var(--text-3xl)' : 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: 'var(--line-height-sm)',
                margin: '0',
                marginBottom: 'var(--ikan-component-spacing-default)'
              }}
            >
              Privacy Policy
            </h1>
            
            <p 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-regular)',
                lineHeight: 'var(--line-height-md)',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              Your privacy and data security are fundamental to our mission.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="w-full mx-auto"
        style={{
          maxWidth: '900px',
          padding: isMobile ? 'var(--ikan-component-spacing-large) var(--ikan-component-spacing-default)' : 'var(--spacing-12) var(--ikan-component-spacing-large)',
          marginTop: '-var(--ikan-component-spacing-large)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Card
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)'
          }}
        >
          <CardContent 
            style={{ 
              padding: isMobile ? 'var(--ikan-component-spacing-large)' : 'var(--spacing-12)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-regular)',
              lineHeight: 'var(--line-height-lg)',
              color: 'var(--color-text-primary)'
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {`"I-Kan;", "ikanhealth.com", "Company", "Firm", "we", "our", "us", "Service Provider" or similar terminology are all in reference to Kaivari Health Tech Pvt. Ltd. as a provider of Services for the remainder of this document.

Kaivari HealthTech Private Limited [CIN:U85100HR2023PTC108876] is the author and publisher of the internet resource i-kan.co.in ("Website") on the world wide web as well as the software and applications provided by I-Kan;, including but not limited to the mobile application(s), Mobile Website, the other associated/ancillary applications, products, websites and services managed by I-Kan; (together with the Website, referred to as the "I-Kan; Platform").

This privacy policy ("Privacy Policy") explains how we collect, use, share, disclose and protect Personal Information about the Users of the I-Kan; Platform, including the Practitioners (as defined in the Terms of Use), the End-Users (as defined in the Terms of Use), and the visitors of Website (jointly and severally referred to as "You" or "Users" in this Privacy Policy). We created this Privacy Policy to demonstrate our commitment to the protection of your privacy and your personal information. Your use of and access to the I-Kan; Platform is subject to this Privacy Policy and our Terms of Use. Any capitalized term used but not defined in this Privacy Policy shall have the meaning attributed to it in our Terms of Use.

WHY THIS PRIVACY POLICY?

This Privacy Policy is published in compliance with, interalia:

Section 43A of the Information Technology Act, 2000.
Regulation 4 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Information) Rules, 2011 (the "SPI Rules").
Regulation 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011.

This Privacy Policy states the following:

The type of information collected from the Users, including Personal Information (as defined in paragraph 2.2.1 below) and Sensitive Personal Data or Information (as defined in paragraph 2.2.2 below) relating to an individual.
The purpose, means and modes of collection, usage, processing, retention, and destruction of such information; and
How and to whom I-Kan; will disclose such information.

COLLECTION OF PERSONAL INFORMATION

Generally, some of the functions on the I-Kan; Platform require us to know who you are so that we can best meet your needs. When you access the I-Kan; Platform, or through any interaction with us via emails, telephone calls or other correspondence, we may ask you to voluntarily provide us with certain information that personally identifies you or could be used to personally identify you. You hereby consent to the collection of such information by I-Kan;. Without prejudice to the generality of the above, information collected by us from you may include (but is not limited to) the following:

contact data (such as your email address and phone number).
demographic data (such as your gender, your date of birth and your pin code).
data regarding your usage of the I-Kan; Platform and history of the appointments made by or with you through the use of I-Kan; Platform.
insurance data (such as your insurance carrier and insurance plan).
other information that you voluntarily choose to provide to us (such as information shared by you with us through emails or letters or uploaded on the platform in connection with the I-Kan; Platform).

The information collected from you by I-Kan; may constitute 'personal information' or 'Sensitive Personal Data or Information' under the SPI Rules.

"Personal Information" is defined under the SPI Rules to mean any information that relates to a natural person, which, either directly or indirectly, in combination with other information available or likely to be available to a body corporate, is capable of identifying such person.

"Sensitive Personal Data or Information" is defined under the SPI Rules to mean personal information about that person relating to:

passwords.
financial information such as bank accounts, credit and debit card details or other payment instrument details.
physical, physiological, and mental health condition.
sexual orientation.
medical records and history.
biometric information.
information received by body corporate under lawful contract or otherwise.
visitor details as provided at the time of registration or thereafter; and
call data records.

I-Kan; will be free to use, collect and disclose information that is freely available in the public domain without your consent.

PRIVACY STATEMENTS

USERS NOTE: THIS SECTION APPLIES TO ALL USERS.

A condition of each User's use of and access to the I-Kan; Platform is their acceptance of the Terms of Use, which also involves acceptance of the terms of this Privacy Policy. Any User that does not agree with any provisions of the same has the option to discontinue the use of the I-Kan; Platform provided by I-Kan; immediately.

An indicative list of information that I-Kan; may require you to provide to enable your use of the I-Kan; Platform is provided in the Schedule annexed to this Privacy Policy.

All the information provided to I-Kan; by a User, including Personal Information or any Sensitive Personal Data or Information, is voluntary. You understand that I-Kan; may use certain information of yours, which has been designated as Personal Information or 'Sensitive Personal Data or Information' under the SPI Rules,

for the purpose of providing you the access of I-Kan; Platform,
for commercial purposes and in an aggregated or non-personally identifiable form for research, statistical analysis and business intelligence purposes,
for sale or transfer of such research, statistical or intelligence data in an aggregated or non-personally identifiable form to third parties and affiliates
for communication purpose so as to provide You a better way of booking appointments and for obtaining feedback in relation to the Practitioners and their practice,
debugging customer support related issues
for the purpose of contacting you to complete any transaction if you do not complete a transaction after having provided us with your contact information in the course of completing such steps that are designed for completion of the transaction.

I-Kan; also reserves the right to use the information provided by or about the End-User for the following purposes:

Publishing such information on the Website.
Contacting End-Users for offering new products or features on the I-Kan; Platform.
Contacting End-Users for taking product and Service feedback.
Analysing software usage patterns for improving product design and utility.
Analysing anonymized practice information for commercial use.
Processing payment instructions including those through independent third-party service providers such as payment gateways, banking and financial institutions, pre-paid instrument, and wallet providers for the processing of payment transaction or deferral of payment facilities.

If you have voluntarily provided your Personal Information to I-Kan; for any of the purposes stated above, you hereby consent to such collection and use of such information by I-Kan;. Furthermore, by providing us with the Personal Information you authorize I-Kan; (including its business partners and affiliates) contact You on Your telephone number(s) and email for any purpose including those mentioned in this sub-section 3.4 above, even if you have registered yourself under DND or DNC or NCPR services. Your authorization shall be valid as long as your account is not deactivated in the manner as provided in clause 3.9 below.

Collection use and disclosure of information which has been designated as Personal Information or Sensitive Personal Data or Information' under the SPI Rules require your express consent. By affirming your assent to this Privacy Policy, you provide your consent to such use, collection and disclosure as required under applicable law.

We do not control or endorse the content, messages or information found on the I-Kan; Platform and, therefore, I-Kan; specifically disclaims any liability with regard to the services and any actions resulting from your participation in any services, and you agree that you waive any claims against I-Kan; relating to same, and to the extent, such waiver may be ineffective, you agree to release any claims against I-Kan; relating to the same.

You are responsible for maintaining the accuracy of the information you submit to us, such as your contact information provided as part of account registration. If your personal information changes, you may correct, delete inaccuracies, or amend information by making the change on our member information page or by contacting us through ikanhealth@gmail.com We will make good faith efforts to make requested changes in our then-active databases as soon as reasonably practicable. If you provide any information that is untrue, inaccurate, out of date or incomplete (or becomes untrue, inaccurate, out of date or incomplete), or I-Kan; has reasonable grounds to suspect that the information provided by you is untrue, inaccurate, out of date or incomplete, I-Kan; may, at its sole discretion, discontinue the access of the I-Kan; Platform to you. There may be circumstances where I-Kan; will not correct, delete or update your Personal Data, including (a) where the Personal Data is opinion data that is kept solely for an evaluative purpose; and (b) the Personal Data is in documents related to a prosecution if all proceedings relating to the prosecution have not been completed.

If you wish to cancel your account on the I-Kan; Platform or request that we no longer use your information, contact us through ikanhealth@gmail.com. We will retain your information for as long as your account on the I-Kan; Platform is active and as needed to provide you with the access to the I-Kan; Platform. We shall not retain such information for longer than is required for the purposes for which the information may lawfully be used or is otherwise required under any other law for the time being in force. After a period of time, your data may be anonymized and aggregated, and then maybe held by us as long as necessary for us to provide our services effectively, but our use of the anonymized data will be solely for analytic purposes. Please note that your withdrawal of consent or cancellation of account may result in I-Kan; being unable to provide you with the access to the I-Kan; Platform or to terminate any existing relationship I-Kan; may have with you.

If you wish to opt-out of receiving non-essential communications such as promotional and marketing-related information regarding the I-Kan; Platform, please send us an email at ikanhealth@gmail.com.

I-Kan; may require the User to pay with a credit card, wire transfer, debit card or cheque for I-Kan; Platform for which subscription amount(s) is/are payable. I-Kan; will collect such User's credit card number and/or other financial institution information such as bank account numbers and will use that information for the billing and payment processes, including but not limited to the use and disclosure of such credit card number and information to third parties as necessary to complete such billing operation. Verification of credit information, however, is accomplished solely by the User through the authentication process. User's credit-card/debit card details are transacted upon secure sites of approved payment gateways which are digitally under encryption, thereby providing the highest possible degree of care as per current technology. However, I-Kan; provides you with an option not to save your payment details. User is advised, however, that internet technology is not full proof safe, and User should exercise discretion on using the same.

Due to the communications standards on the Internet, when a User or the End-User or anyone who visits the Website, I-Kan; automatically receives the URL of the site from which anyone visits. I-Kan; also receives the Internet Protocol (IP) address of each User's computer (or the proxy server a User used to access the World Wide Web), User's computer operating system and type of web browser the User is using, email patterns, as well as the name of User's ISP. This information is used to analyse overall trends to help I-Kan; improve its Service. The linkage between User's IP address and User's personally identifiable information is not shared with or disclosed to third parties. Notwithstanding the above, I-Kan; may share and/or disclose some of the aggregate findings (not the specific data) in anonymized form (i.e., non-personally identifiable) with advertisers, sponsors, investors, strategic partners, and others in order to help grow its business.

The Website uses temporary cookies to store certain (that is not sensitive personal data or information) that is used by I-Kan; and its service providers for the technical administration of the Website, research, and development, and User administration. In the course of serving advertisements or optimizing services to its Users, I-Kan; may allow authorized third parties to place or recognize a unique cookie on the User's browser. The cookies, however, do not store any Personal Information of the User. You may adjust your Internet browser to disable cookies. If cookies are disabled you may still use the Website, but the Website may be limited in the use of some of the features.

A User may have limited access to the Website without creating an account on the Website. In order to have access to all the features and benefits on our Website, a User must first create an account on our Website. To create an account, a User is required to provide the following information, which such User recognizes and expressly acknowledges is Personal Information allowing others, including I-Kan;, to identify the User, Name Email address, Phone number, password chosen by the User. Other information requested on the registration page, including the ability to receive promotional offers from I-Kan;, is optional. I-Kan; may, in future, include other optional requests for information from the User to help I-Kan; to customize the Website to deliver personalized information to the User.

This Privacy Policy applies to services that are owned and operated by I-Kan;. I-Kan; does not exercise control over third party links from within the I-Kan; Platform. These other sites may place their own cookies or other files on the Users' computer, collect data or solicit personal information from the Users, for which I-Kan; is not responsible or liable. Accordingly, I-Kan; does not make any representations concerning the privacy practices or policies of such third parties or terms of use of such websites, nor does I-Kan; guarantee the accuracy, integrity, or quality of the information, data, text, software, sound, photographs, graphics, videos, messages or other materials available on such websites. The inclusion or exclusion does not imply any endorsement by I-Kan; of the website, the website's provider, or the information on the website. If you decide to visit a third-party website linked to the Website, you do this entirely at your own risk. I-Kan; encourages the User to read the privacy policies of that website.

The Website may enable User to communicate with other Users or to post information to be accessed by others, whereupon other Users may collect such data. Such Users, including any moderators or administrators, are not authorized I-Kan; representatives or agents, and their opinions or statements do not necessarily reflect those of I-Kan;, and they are not authorized to bind I-Kan; to any contract. I-Kan; hereby expressly disclaims any liability for any reliance or misuse of such information that is made available by Users or visitors in such a manner.

I-Kan; does not collect information about the visitors of the Website from other sources, such as public records or bodies, or private organisations, save and except for the purposes of registration of the Users (the collection, use, storage and disclosure of which each End User must agree to under the Terms of Use in order for I-Kan; to effectively render the services through the I-Kan; Platform).

I-Kan; maintains a strict "No-Spam" policy, which means that I-Kan; does not intend to sell, rent, or otherwise give your e-mail address to a third party without your consent.

I-Kan; has implemented best international market practices and security policies, rules, and technical measures to protect the personal data that it has under its control from unauthorised access, improper use or disclosure, unauthorised modification and unlawful destruction or accidental loss. However, for any data loss or theft due to unauthorized access to the User's electronic devices through which the User avails the services through the I-Kan; Platform, I-Kan; shall not be held liable for any loss whatsoever incurred by the User.

I-Kan; implements reasonable security practices and procedures and has a comprehensively documented information security programme and information security policies that contain managerial, technical, operational and physical security control measures that are commensurate with respect to the information being collected and the nature of I-Kan; business.

I-Kan; takes your right to privacy very seriously and other than as specifically stated in this Privacy Policy, will only disclose your Personal Information in the event it is required to do so by law, rule, regulation, law enforcement agency, governmental official, legal authority or similar requirements or when I-Kan;, in its sole discretion, deems it necessary in order to protect its rights or the rights of others, to prevent harm to persons or property, to fight fraud and credit risk, or to enforce or apply the Terms of Use.

PRACTITIONERS NOTE: THIS SECTION APPLIES TO ALL PRACTITIONERS.

As part of the registration as well as the application creation and submission process that is available to Practitioners on I-Kan;, certain information, including Personal Information or Sensitive Personal Data or Information is collected from the Practitioners.

All the statements in this Privacy Policy apply to all Practitioners, and all Practitioners are therefore required to read and understand the privacy statements set out herein prior to submitting any Personal Information or Sensitive Personal Data or Information to I-Kan;, failing which they are required to leave the I-Kan; Platform, including the Website immediately.

Practitioners' personally identifiable information, which they choose to provide to I-Kan;, is used to help the Practitioners describe and identify themselves. This information is exclusively owned by I-Kan; You will be the owner of your information and you consent to I-Kan; collecting, using, processing, and/or disclosing this information for the purposes hereinafter stated. I-Kan; may use such information for commercial purposes and in an aggregated or non-personally identifiable form for research, statistical analysis and business intelligence purposes, and may sell or otherwise transfer such research, statistical or intelligence data in an aggregated or non-personally identifiable form to third parties and affiliates. I-Kan; also reserves the right to use the information provided by or about the Practitioner for the following purposes:

Publishing such information on the Website.
Contacting Practitioners for offering new products or I-Kan; Platform.
Contacting Practitioners for taking product feedback.
Analysing software usage patterns for improving product design and utility.
Analysing anonymized practice information including financial, and inventory information for commercial use.

I-Kan; automatically enables the listing of Practitioners' information on its Website as provided by You using the I-Kan; Platform. The Practitioner information listed on Website is displayed when End-Users search for Practitioners on Website, and the Practitioner information listed on Website is used by End-Users to request for appointments. Any personally identifiable information of the Practitioners listed on the Website is not generated by I-Kan; and is provided to I-Kan; by Practitioners who wish to enlist themselves on the Website or is collected by I-Kan; from the public domain. I-Kan; displays such information on its Website on an as-is basis making no representation or warranty on the accuracy or completeness of the information. As such, we strongly encourage Practitioners to check the accuracy and completeness of their information from time to time and inform us immediately of any discrepancies, changes, or updates to such information. I-Kan; will, however, take reasonable steps to ensure the accuracy and completeness of this information.

I-Kan; may also display information for Practitioners who have not signed up or registered for the I-Kan; Platform, provided that the Practitioners have consented to I-Kan; collecting, processing, and/or disclosing their information on the Website. Such Practitioners are verified by I-Kan; or its associates, and I-Kan; makes every effort to capture accurate information for such Practitioners. However, I-Kan; does not undertake any liability for any incorrect or incomplete information appearing on the Website for such Practitioners.

END-USERS NOTE: THIS SECTION APPLIES TO ALL END-USERS.

As part of the registration/application creation and submission process that is available to End-Users on this Website, certain information, including Personal Information or Sensitive Personal Data or Information is collected from the End-Users.

All the statements in this Privacy Policy apply to all End-Users, and all End-Users are therefore required to read and understand the privacy statements set out herein prior to submitting any Personal Information or Sensitive Personal Data or Information to I-Kan;, failing which they are required to leave the I-Kan; immediately.

If you have inadvertently submitted any such information to I-Kan; prior to reading the privacy statements set out herein, and you do not agree with the manner in which such information is collected, processed, stored, used or disclosed, then you may access, modify and delete such information by using options provided on the Website. In addition, you can, by sending an email to ikanhealth@gmail.com, inquire whether I-Kan; is in possession of your personal data, and you may also require I-Kan; to delete and destroy all such information.

End-Users' personally identifiable information, which they choose to provide on the Website is used to help the End-Users describe/identify themselves. Other information that does not personally identify the End-Users as an individual, is collected by I-Kan; from End-Users (such as, patterns of utilization described above) and is exclusively owned by I-Kan;. I-Kan; may also use such information in an aggregated or non-personally identifiable form for research, statistical analysis and business intelligence purposes, and may sell or otherwise transfer such research, statistical or intelligence data in an aggregated or non-personally identifiable form to third parties and affiliates. In particular, I-Kan; reserves with it the right to use anonymized End-User demographics information and anonymized End-User health information for the following purposes:

Analysing software usage patterns for improving product design and utility.
Analysing such information for research and development of new technologies.
Using analysis of such information in other commercial product offerings of I-Kan;.
Sharing analysis of such information with third parties for commercial use.

I-Kan; will communicate with the End-Users through email, phone and notices posted on the Website or through other means available through the service, including text and other forms of messaging. The End-Users can change their e-mail and contact preferences at any time by logging into their "Dashboard" at www.I-Kan;.co and changing the account settings.

At times, I-Kan; conducts a User survey to collect information about End-Users' preferences. These surveys are optional and if End-Users choose to respond, their responses will be kept anonymous. Similarly, I-Kan; may offer contests to qualifying End-Users in which we ask for contact and demographic information such as name, email address and mailing address. The demographic information that I-Kan; collects in the registration process and through surveys is used to help I-Kan; improve the I-Kan; Platform to meet the needs and preferences of End-Users.

I-Kan; may keep records of electronic communications and telephone calls received and made for making appointments or other purposes for the purpose of administration of services through the I-Kan; Platform, customer support, research, and development and for better listing of Practitioners.

All I-Kan; employees and data processors, who have access to, and are associated with the processing of sensitive personal data or information, are obliged to respect the confidentiality of every End-Users' Personal Information or Sensitive Personal Data and Information. I-Kan; has put in place procedures and technologies as per good industry practices and in accordance with the applicable laws, to maintain the security of all personal data from the point of collection to the point of destruction. Any third-party data processor to which I-Kan; transfers Personal Data shall have to agree to comply with those procedures and policies or put in place adequate measures on their own.

I-Kan; may also disclose or transfer End-Users' personal and other information provided by a User, to a third party as part of reorganization or a sale of the assets of a I-Kan;. Any third party to which I-Kan; transfers or sells its assets will have the right to continue to use the personal and other information that End-Users provide to us, in accordance with the Terms of Use

To the extent necessary to provide End-Users with the services through the I-Kan; Platform, I-Kan; may provide their Personal Information to third party contractors who work on behalf of or with I-Kan; to provide End-Users with such services through the I-Kan; Platform, to help I-Kan; communicate with End-Users or to maintain the Website or independent third-party service providers to process payment instructions including providing a payment deferral facility to End-Users in relation to the services through the I-Kan; Platform. These third-party service providers have access to information needed to process payments but may not use it for other purposes. Generally, these contractors do not have any independent right to share this information, however, certain contractors who provide services through the I-Kan; Platform on the Website, including the providers of online communications services, may use and disclose the personal information collected in connection with the provision of these services through the I-Kan; Platform in accordance with their own privacy policies. In such circumstances, you consent to us disclosing your Personal Information to contractors, solely for the intended purposes only.

CASUAL VISITORS NOTE:

No sensitive personal data or information is automatically collected by I-Kan; from any casual visitors of this website, who are merely perusing the Website.

Nevertheless, certain provisions of this Privacy Policy are applicable to even such casual visitors, and such casual visitors are also required to read and understand the privacy statements set out herein, failing which they are required to leave this Website immediately.

If you, as a casual visitor, have inadvertently browsed any other page of this Website prior to reading the privacy statements set out herein, and you do not agree with the manner in which such information is obtained, collected, processed, stored, used, disclosed or retained, merely quitting this browser application should ordinarily clear all temporary cookies installed by I-Kan;. All visitors, however, are encouraged to use the "clear cookies" functionality of their browsers to ensure such clearing/deletion, as I-Kan; cannot guarantee, predict or provide for the behaviour of the equipment of all the visitors of the Website.

You are not a casual visitor if you have willingly submitted any personal data or information to I-Kan; through any means, including email, post or through the registration process on the Website. All such visitors will be deemed to be and will be treated as, Users for the purposes of this Privacy Policy, and in which case, all the statements in this Privacy Policy apply to such persons.

CONFIDENTIALITY AND SECURITY

Your Personal Information is maintained by I-Kan; in electronic form on its equipment, and on the equipment of its employees. Such information may also be converted to physical form from time to time. I-Kan; takes all necessary precautions to protect your personal information both online and off-line and implements reasonable security practices and measures including certain managerial, technical, operational and physical security control measures that are commensurate with respect to the information being collected and the nature of I-Kan; business.

No administrator at I-Kan; will have knowledge of your password. It is important for you to protect against unauthorized access to your password, your computer, and your mobile phone. Be sure to log off from the Website when finished. I-Kan; does not undertake any liability for any unauthorised use of your account and password. If you suspect any unauthorized use of your account, you must immediately notify I-Kan; by sending an email to ikanhealth@gmail.com. You shall be liable to indemnify I-Kan; due to any loss suffered by it due to such unauthorized use of your account and password.

I-Kan; makes all User information accessible to its employees, agents, or partners and third parties only on a need-to-know basis and binds only its employees to strict confidentiality obligations.

Part of the functionality of I-Kan; is assisting the Practitioners to maintain and organise such information. I-Kan; may, therefore, retain and submit all such records to the appropriate authorities, or to Practitioners who request access to such information.

Part of the functionality of the I-Kan; is assisting the End Users to access information relating to them. I-Kan; may, therefore, retain and submit all such records to the relevant End Users, or to their Practitioners.

Notwithstanding the above, I-Kan; is not responsible for the confidentiality, security, or distribution of your Personal Information by our partners and third parties outside the scope of our agreement with such partners and third parties. Further, I-Kan; shall not be responsible for any breach of security or for any actions of any third parties or events that are beyond the reasonable control of I-Kan; including but not limited to, acts of government, computer hacking, unauthorised access to computer data and storage device, computer crashes, breach of security and encryption, poor quality of Internet service or telephone service of the User etc.

CHANGE TO PRIVACY POLICY

I-Kan; may update this Privacy Policy at any time, with or without advance notice. In the event, there are significant changes in the way I-Kan; treats User's personally identifiable information, or in the Privacy Policy itself, I-Kan; will display a notice on the Website or send Users an email, as provided for above, so that you may review the changed terms prior to continuing to use the I-Kan; Platform. As always, if you object to any of the changes to our terms, and you no longer wish to use the I-Kan; Platform, you may contact ikanhealth@gmail.com to deactivate your account. Unless stated otherwise, I-Kan; current Privacy Policy applies to all information that I-Kan; has about you and your account.

If a User uses the I-Kan; Platform or accesses the Website after a notice of changes has been sent to such User or published on the Website, such User hereby provides his/her/its consent to the changed terms.

CHILDREN'S AND MINOR'S PRIVACY

I-Kan; strongly encourages parents and guardians to supervise the online activities of their minor children and consider using parental control tools available from online I-Kan; Platform and software manufacturers to help provide a child-friendly online environment. These tools also can prevent minors from disclosing their name, address, and other personally identifiable information online without parental permission. Although the I-Kan; Website and I-Kan; Platform are not intended for use by minors, I-Kan; respects the privacy of minors who may inadvertently use the internet or the mobile application.

CONSENT TO THIS POLICY

You acknowledge that this Privacy Policy is a part of the Terms of Use of the Website and the I-Kan; Platform, and you unconditionally agree that becoming a User of the Website and the I-Kan; Platform signifies your (i) assent to this Privacy Policy, and (ii) consent to I-Kan; using, collecting, processing and/or disclosing your Personal Information in the manner and for the purposes set out in this Privacy Policy. Your visit to the Website and use of the I-Kan; Platform is subject to this Privacy Policy and the Terms of Use.

ADDRESS FOR PRIVACY QUESTIONS

Should you have questions about this Privacy Policy or I-Kan; information collection, use and disclosure practices, you may contact, the Grievance Officer appointed by I-Kan; in accordance with the provisions the Information Technology Act, 2000 and Rule 3(11) of Information Technology (Intermediaries guidelines) Rules, 2011. We will use reasonable efforts to respond promptly to any requests, questions, or concerns, which you may have regarding our use of your personal information. If you have any grievance with respect to our use of your information, you may communicate such grievance to the Grievance Officer:

Name: Sachin Vaishampayan
Address: Kaivari Health Tech, WeWork, 5th Floor, 5th Floor, DLF Two Horizon Centre, DLF Phase 5, Gurugram, Haryana 122002
Phone: 6388314064
Email: ikanhealth@gmail.com

SCHEDULE

Indicative List of Information by Nature of Service

End-Users using the I-Kan; Platform by registering for an account: You can create an account by giving us information regarding your [name, mobile number, email address], and such other information as requested on the End-User registration page. This is to enable us to provide you with the facility to use the account to book your appointments and store other health-related information.

End-Users using the Website without registering for an account (i.e. 'Guest' End-User): You can use the Website (with limited functionality) without registering for an account, but to book an appointment, you may be asked to create an account and/or certain information (including your [mobile number, email ], and such other information as requested when you choose to use the I-Kan; Platform without registration) to confirm the appointment.

Practitioner listing on the Website and Availing I-Kan; Platform: As a Practitioner, you may be required to provide us with information regarding your [name, mobile number, email address], and such other information as requested on the Practitioner registration page to create an account. I-Kan; may send an email and/or SMS confirmations or other communications to End-Users in connection with their bookings, appointments, or other interactions with you if such interactions have been facilitated by I-Kan;.

Practitioners using I-Kan; products and I-Kan; Platform: You will be required to create an account and may be required to provide I-Kan; with information regarding your [name, mobile number, email address], and such other information as requested by I-Kan;, in order to complete your registration. Upon registration, I-Kan; will access to your customer/client information and their medical records. You agree to make your customer/client fully aware of such access.I-Kan; reserves the right to extend and withdraw booking facility to you at its sole discretion, based on the number of End-User appointments being honoured by you. The extension or withdrawal of such facility shall be intimated to you by I-Kan;.`}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card 
          className="mt-12"
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-light)',
            marginTop: 'var(--spacing-12)',
            textAlign: 'center'
          }}
        >
          <CardContent style={{ padding: 'var(--ikan-component-spacing-large)' }}>
            <div className="space-y-4">
              <h3 
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)',
                  margin: '0'
                }}
              >
                Questions about Privacy?
              </h3>
              
              <p 
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-regular)',
                  color: 'var(--color-text-muted)',
                  margin: '0',
                  lineHeight: 'var(--line-height-md)',
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                Contact our Grievance Officer for any privacy-related concerns.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <a
                  href="mailto:ikanhealth@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-primary-default)',
                    color: 'var(--color-text-inverse)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    borderRadius: 'var(--ikan-component-border-radius)',
                    height: '48px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <Icon name="mail" size={20} />
                  ikanhealth@gmail.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}