import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useNotifications } from '../../contexts/NotificationContext';
import { ResourceBlock } from '../blocks/ResourceBlock';
import { NewsletterBlock } from '../blocks/NewsletterBlock';
import { ContextBlock } from '../blocks/ContextBlock';
import { getLatestResourcePosts } from '../../lib/sample-data/resource-posts';
// Desktop imports
import svgPaths from "../../imports/svg-qo9pds304d";
import { imgGroup as imgGroupDesktop } from "../../imports/svg-3566o";
// Mobile imports  
import svgPathsMobile from "../../imports/svg-rbsc8v77kz";
import { imgGroup as imgGroupMobile, imgGroup1 as imgGroup1Mobile } from "../../imports/svg-k6678";

// Shared image assets - Using Unsplash URLs
const imgContainer = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop";
const img66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop";
const imgReasons1S4Foms = "https://images.unsplash.com/photo-1551135049-8a33b5883817?w=400&h=300&fit=crop";
const imgReasons2Souf7K = "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=400&h=300&fit=crop";
const imgReasons2Zmn7Mt = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop";
const img65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop";
const img65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop";
const imgRectangle240648987 = "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=600&h=400&fit=crop";
const imgDtsFitnessAllieLehmanPhotosId1797CopyWebp = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop";
const imgFireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop";
const imgDtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=400&fit=crop";
const imgNewsletterCommunity = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop";
// Mobile-specific assets
const imgAsset31 = "https://images.unsplash.com/photo-1551135049-8a33b5883817?w=150&h=150&fit=crop";
const imgIso27001InformationSecurityLogoPngSvgVector = "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=150&h=150&fit=crop";
const imgLayer1 = "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=150&h=150&fit=crop";
const imgLayer4 = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=150&h=150&fit=crop";
const imgLayer2 = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&h=150&fit=crop";
const imgLayer3 = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop";

// Desktop Header Components
function DesktopHeader({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div className="hidden lg:block bg-white box-border content-stretch flex flex-col gap-[20px] items-start px-0 pt-0 pb-[100px] relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="relative shrink-0 w-full">
          <div className="size-full">
            <div 
              className="box-border content-stretch flex flex-col items-start pl-[100px] pr-0 py-0 relative w-full"
              style={{
                marginTop: 'calc(-1 * var(--ikan-nav-clearance-desktop, 128px))',
                paddingTop: 'var(--ikan-nav-clearance-desktop, 128px)',
                backgroundColor: 'white'
              }}
            >
              <div className="content-stretch flex gap-[32px] h-[550px] items-center relative shrink-0 w-full">
                {/* Text Content */}
                <div className="basis-0 content-stretch flex flex-col gap-[24px] grow items-start min-h-px min-w-px relative shrink-0">
                  <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="box-border content-stretch flex flex-col items-start pb-[0.695px] pt-0 px-0 relative shrink-0 w-full">
                        <div className="flex flex-col justify-center leading-[72px] not-italic relative shrink-0 w-full" style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-4xl)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)'
                        }}>
                          <p>About iKan</p>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="flex flex-col justify-center leading-[24px] not-italic relative shrink-0 w-full" style={{ 
                        fontFamily: 'var(--font-family-base)', 
                        fontSize: 'var(--text-base)', 
                        color: 'var(--color-text-muted)',
                        fontWeight: 'var(--font-weight-regular)'
                      }}>
                        <p className="mb-0">{ABOUT_CONTENT.hero.description}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={onGetStarted}
                    className="ikan-button mobile-button touch-target cursor-pointer hover:opacity-90 transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--color-primary-default)',
                      color: 'var(--color-primary-on)',
                      borderRadius: 'var(--radius-sm)',
                      height: '48px',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Get Started
                  </button>
                  <div className="box-border content-stretch flex gap-[25.3px] items-start pb-0 pt-[0.77px] px-0 relative shrink-0 w-full">
                    {ABOUT_CONTENT.hero.features.map((feature, index) => (
                      <div key={index} className="h-[19.39px] relative shrink-0">
                        <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[157.97px] py-[3.695px] top-0">
                          <div className="relative shrink-0 size-[12px]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                              <g>
                                <path d={svgPaths.p1d812c00} fill="var(--fill-0, #545457)" />
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="absolute flex flex-col h-[20px] justify-center leading-[19.4px] left-[17.92px] not-italic top-[9.5px] translate-y-[-50%] w-[152.368px]" style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-muted)'
                        }}>
                          <ul className="ml-[-1.5em]">
                            <li className="list-disc ms-[19.05px]">
                              <span>{feature}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hero Image */}
                <div className="flex h-full items-center justify-center relative shrink-0" style={{ "--transform-inner-width": "760.015625", "--transform-inner-height": "550" } as React.CSSProperties}>
                  <div className="flex-none h-full rotate-[359.586deg] skew-x-[359.586deg]">
                    <div className="h-full relative w-[760.019px]">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img alt="About iKan hero" className="absolute h-[96.12%] left-[0.27%] max-w-none top-[3.88%] w-[103.65%]" src={imgContainer} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Header Components
function MobileHeader({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div className="lg:hidden bg-white box-border content-stretch flex flex-col gap-[20px] items-start pb-[40px] pt-0 px-0 relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <div className="relative shrink-0 w-full">
          <div className="size-full">
            <div className="box-border content-stretch flex flex-col items-start px-[20px] py-0 relative w-full">
              <div className="content-stretch flex flex-col gap-[32px] items-start justify-center relative shrink-0 w-full">
                {/* Hero Image */}
                <div className="flex items-center justify-center relative shrink-0 w-full" style={{ "--transform-inner-width": "1160", "--transform-inner-height": "219" } as React.CSSProperties}>
                  <div className="flex-none skew-x-[359.586deg] w-full">
                    <div className="h-[219.006px] relative w-full">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img alt="About iKan mobile hero" className="absolute h-[106.71%] left-[0.25%] max-w-none top-[-1.37%] w-[99.5%]" src={imgContainer} />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Text Content */}
                <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="box-border content-stretch flex flex-col items-start pb-[0.695px] pt-0 px-0 relative shrink-0 w-full">
                        <div className="flex flex-col justify-center leading-[50px] not-italic relative shrink-0 w-full" style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-3xl)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text-primary)'
                        }}>
                          <p>About iKan</p>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                      <div className="flex flex-col justify-center leading-[21px] not-italic relative shrink-0 w-full" style={{ 
                        fontFamily: 'var(--font-family-base)', 
                        fontSize: 'var(--text-sm)', 
                        color: 'var(--color-text-muted)',
                        fontWeight: 'var(--font-weight-regular)'
                      }}>
                        <p>{ABOUT_CONTENT.hero.description}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={onGetStarted}
                    className="ikan-button mobile-button touch-target cursor-pointer hover:opacity-90 transition-all duration-200 w-full"
                    style={{
                      backgroundColor: 'var(--color-primary-default)',
                      color: 'var(--color-primary-on)',
                      borderRadius: 'var(--radius-sm)',
                      height: '48px',
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Get Started
                  </button>
                  <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                    {ABOUT_CONTENT.hero.features.map((feature, index) => (
                      <div key={index} className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
                        <div className="content-stretch flex flex-col h-[19.39px] items-start justify-center overflow-clip relative shrink-0">
                          <div className="relative shrink-0 size-[12px]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                              <g>
                                <path d={svgPathsMobile.p1d812c00} fill="var(--fill-0, #545457)" />
                              </g>
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-col h-[20px] justify-center leading-[19.4px] not-italic relative shrink-0" style={{
                          fontFamily: 'var(--font-family-base)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-regular)',
                          color: 'var(--color-text-muted)'
                        }}>
                          <p>{feature}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Mission Section
function DesktopMissionSection({ onVideoPlay }: { onVideoPlay?: () => void }) {
  return (
    <div className="hidden lg:block">
      <ContextBlock
        title={ABOUT_CONTENT.mission.title}
        content={ABOUT_CONTENT.mission.description}
        image={img66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp}
        imageAlt="Expert interview"
        videoCaption="Watch the full\ninterview"
        showPlayButton={true}
        onVideoClick={onVideoPlay}
      />
    </div>
  );
}

// Mobile Mission Section
function MobileMissionSection({ onVideoPlay }: { onVideoPlay?: () => void }) {
  return (
    <div className="lg:hidden box-border content-stretch flex flex-col items-center px-[20px] py-[40px] relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[23.55px] isolate items-center relative shrink-0 w-full">
        {/* Video Interview */}
        <div className="h-[267px] relative shrink-0 w-full z-[2]">
          <div className="flex flex-col justify-end size-full">
            <div className="box-border content-stretch flex flex-col gap-[10px] h-[267px] items-start justify-end px-[4px] py-[24px] relative w-full">
              <div className="absolute content-stretch flex flex-col inset-0 items-start justify-center overflow-clip rounded-[14.49px]">
                <div className="basis-0 grow max-w-[426.95px] min-h-px min-w-px relative rounded-[14.49px] shrink-0 w-full">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[14.49px]">
                    <img alt="Expert interview" className="absolute h-full left-[-13.26%] max-w-none top-0 w-[126.53%]" src={img66292B188D01B0Eb2Ae89AdcCmInterviewThumbnailP500Webp} />
                  </div>
                </div>
                <div className="absolute bg-gradient-to-b bottom-[-0.3px] from-35% from-[rgba(255,255,255,0)] left-0 rounded-[14.49px] to-[rgba(0,0,0,0.4)] top-0 w-[426.95px]" />
              </div>
              <button 
                onClick={onVideoPlay}
                className="h-[50.72px] relative shrink-0 w-[402.75px] cursor-pointer hover:opacity-90 transition-all duration-200 touch-target"
                aria-label="Play video interview"
              >
                <div className="absolute left-0 size-[50.72px] top-1/2 translate-y-[-50%]">
                  <div className="absolute left-1/2 size-[50.72px] top-1/2 translate-x-[-50%] translate-y-[-50%]">
                    <div className="absolute contents inset-[0.78%_0.96%_1.14%_0.96%]">
                      <div className="absolute inset-[9.98%_10.16%_10.34%_10.16%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4.663px_-4.664px] mask-size-[49.745px_49.746px]" style={{ maskImage: `url('${imgGroupMobile}')` }}>
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 41 41">
                          <g>
                            <path d={svgPathsMobile.p163e1ff0} fill="var(--fill-0, white)" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute box-border content-stretch flex flex-col items-start left-[61.57px] pb-[0.605px] pl-0 pr-[152.1px] pt-0 translate-y-[-50%]" style={{ top: "calc(50% - 0.561px)" }}>
                  <div className="flex flex-col font-medium justify-center leading-[21.74px] not-italic relative shrink-0 text-nowrap text-white tracking-[-0.16px] whitespace-pre" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    <p className="mb-0">Watch the full</p>
                    <p>interview</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mission Text */}
        <div className="relative rounded-[14.49px] shrink-0 w-full z-[1]" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="flex flex-col items-center size-full">
            <div className="box-border content-stretch flex flex-col items-center p-[16px] relative w-full">
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[318px]">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[42px] not-italic relative shrink-0 text-nowrap" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    <p className="whitespace-pre">Our Mission</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[21px] not-italic relative shrink-0 w-full" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)'
                  }}>
                    <p>We believe mental health support should be accessible, effective, and empowering. Our evidence-based approach combines the latest research with compassionate care.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop What We Do Section
function DesktopWhatWeDoSection({ onServiceClick }: { onServiceClick?: (service: typeof ABOUT_CONTENT.services[0]) => void }) {

  return (
    <div className="hidden lg:block box-border content-stretch flex flex-col items-center px-0 py-[100px] relative shrink-0 w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="content-stretch flex flex-col gap-[40px] items-start overflow-clip relative shrink-0 w-full">
        <div className="relative shrink-0 w-full">
          <div className="size-full">
            <div className="box-border content-stretch flex flex-col items-start px-[100px] py-0 relative w-full">
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-[1120px]">
                <div className="flex flex-col justify-center leading-[60px] not-italic relative shrink-0 w-full" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  <p>What We Do</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative shrink-0 w-full">
          <div className="flex flex-row items-center size-full">
            <div className="box-border content-stretch flex gap-[24px] items-center px-[100px] py-0 relative w-full">
              {ABOUT_CONTENT.services.map((service, index) => (
                <button 
                  key={index} 
                  onClick={() => onServiceClick?.(service)}
                  className="basis-0 bg-[#eff1f4] content-stretch flex flex-col grow h-full items-start min-h-px min-w-px relative rounded-[24px] shrink-0 cursor-pointer hover:shadow-md transition-all duration-200 touch-target"
                  aria-label={`Learn more about ${service.title}`}
                >
                  <div className="relative shrink-0 w-full">
                    <div className="size-full">
                      <div className="box-border content-stretch flex flex-col gap-[16px] items-start pb-[58px] pt-[32px] px-[32px] relative w-full">
                        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                          <div className="flex flex-col justify-center leading-[35px] not-italic relative shrink-0 w-full" style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)'
                          }}>
                            <p>{service.title}</p>
                          </div>
                        </div>
                        <div className="box-border content-stretch flex flex-col items-start min-h-[63px] pb-[0.905px] pt-0 px-0 relative shrink-0 w-full">
                          <div className="flex flex-col justify-center leading-[24px] not-italic relative shrink-0 w-full" style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-weight-regular)',
                            color: 'var(--color-text-muted)'
                          }}>
                            <p>{service.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-[250px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-bl-[24px] rounded-br-[24px]">
                      <img alt={service.title} className="absolute h-full left-[-6.59%] max-w-none top-0 w-[113.18%]" src={service.image} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile What We Do Section
function MobileWhatWeDoSection({ onServiceClick }: { onServiceClick?: (service: typeof ABOUT_CONTENT.services[0]) => void }) {

  return (
    <div className="lg:hidden box-border content-stretch flex flex-col items-center px-0 py-[40px] relative shrink-0 w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip relative shrink-0 w-full">
        <div className="relative shrink-0 w-full">
          <div className="size-full">
            <div className="box-border content-stretch flex flex-col items-start px-[20px] py-0 relative w-full">
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <div className="flex flex-col justify-center leading-[42px] not-italic relative shrink-0 w-full" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  <p>What We Do</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative shrink-0 w-full">
          <div className="flex flex-col justify-center size-full">
            <div className="box-border content-stretch flex flex-col gap-[16px] items-start justify-center px-[20px] py-0 relative w-full">
              {ABOUT_CONTENT.services.map((service, index) => (
                <button 
                  key={index} 
                  onClick={() => onServiceClick?.(service)}
                  className="bg-[#eff1f4] content-stretch flex flex-col h-[357px] items-start relative rounded-[16px] shrink-0 w-full cursor-pointer hover:shadow-md transition-all duration-200 touch-target"
                  aria-label={`Learn more about ${service.title}`}
                >
                  <div className="relative shrink-0 w-full">
                    <div className="size-full">
                      <div className="box-border content-stretch flex flex-col gap-[8px] items-start pb-[40px] pt-[16px] px-[16px] relative w-full">
                        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                          <div className="flex flex-col justify-center leading-[25px] not-italic relative shrink-0 w-full" style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)'
                          }}>
                            <p>{service.title}</p>
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col items-start max-w-[500px] relative shrink-0 w-full">
                          <div className="flex flex-col justify-center leading-[21px] not-italic relative shrink-0 w-full" style={{
                            fontFamily: 'var(--font-family-base)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-regular)',
                            color: 'var(--color-text-muted)'
                          }}>
                            <p>{service.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="basis-0 grow min-h-px min-w-px relative rounded-bl-[16px] rounded-br-[16px] shrink-0 w-full">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-bl-[16px] rounded-br-[16px]">
                      <img alt={service.title} className="absolute h-full left-[-6.59%] max-w-none top-0 w-[113.18%]" src={service.image} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Values Section
function DesktopValuesSection({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div className="hidden lg:block relative shrink-0 w-full">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col items-center p-[100px] relative w-full">
          <div className="content-stretch flex flex-col gap-[40px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[17.11px] items-start max-w-[695.712px] relative shrink-0 w-[695.7px]">
              <div className="box-border content-stretch flex flex-col items-center pb-[0.81px] pt-0 px-0 relative shrink-0 w-full">
                <div className="flex flex-col justify-center leading-[60px] not-italic relative shrink-0 text-center text-nowrap" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  <p className="whitespace-pre">Our Values</p>
                </div>
              </div>
            </div>
            
            <div className="h-[466px] relative shrink-0 w-full">
              {/* Professional Excellence Card */}
              <div className="absolute box-border content-stretch flex flex-col gap-[28px] h-[466px] items-start left-[3px] px-[57px] py-[55px] right-[629px] rounded-[14.49px] translate-y-[-50%]" style={{ top: "calc(50% + 0.078px)", backgroundColor: 'var(--color-primary-default)' }}>
                <div className="h-[72.47px] relative shrink-0 w-[234.61px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="Professional psychologists" className="absolute h-full left-[2.62%] max-w-none top-0 w-[94.75%]" src={img65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif} />
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[30px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-inverse)'
                  }}>
                    <p className="mb-0">Professional Excellence &</p>
                    <p className="mb-0">Evidence-Based Care</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[24px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-inverse)'
                  }}>
                    <p className="mb-0">iKan provides professional support and creates</p>
                    <p>an environment of understanding and appreciation.</p>
                  </div>
                </div>
                <button 
                  onClick={onGetStarted}
                  className="ikan-button touch-target cursor-pointer hover:opacity-90 transition-all duration-200 w-full"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-inverse)',
                    border: '1px solid #d9e1cf',
                    borderRadius: 'var(--radius-sm)',
                    height: '48px',
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Discover our programs
                </button>
              </div>
              
              {/* Digital Access Card */}
              <div className="absolute bg-white bottom-[243.92px] left-[629px] right-0 rounded-[14.49px] top-[0.08px]">
                <div className="absolute content-stretch flex flex-col items-start left-[34.42px] right-[293.8px] top-[54.4px]">
                  <div className="flex flex-col justify-center leading-[30px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    <p className="mb-0">Wherever you are, iKan is 100%</p>
                    <p className="mb-0">digital and always</p>
                    <p>there for you.</p>
                  </div>
                </div>
                <div className="absolute h-[210.16px] left-[306.18px] right-[22.04px] top-[11.53px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="iKan mobile app" className="absolute h-[90.04%] left-0 max-w-none top-[13.39%] w-[91.49%]" src={img65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif} />
                  </div>
                </div>
              </div>
              
              {/* Safety & Pricing Cards */}
              <div className="absolute bottom-[-0.08px] content-stretch flex gap-[18px] items-start justify-center left-[629px] right-0 top-[240.08px]">
                <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[14.49px] shrink-0">
                  <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[14.49px]" style={{ borderColor: 'var(--color-border-default)' }} />
                  <div className="absolute content-stretch flex flex-col items-start left-[34.94px] right-[36.47px] top-[97.91px]">
                    <div className="flex flex-col justify-center leading-[30px] not-italic relative shrink-0 text-nowrap" style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-primary)'
                    }}>
                      <p className="whitespace-pre">Safety First</p>
                    </div>
                  </div>
                  <div className="absolute content-stretch flex flex-col items-start left-[34.51px] right-[36.9px] top-[134.02px]">
                    <div className="flex flex-col justify-center leading-[24px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-muted)'
                    }}>
                      <p className="mb-0">Data security and confidentiality</p>
                      <p className="mb-0">have the highest priority for us.</p>
                    </div>
                  </div>
                  <div className="absolute bg-neutral-100 box-border content-stretch flex gap-[6.25px] items-center justify-center left-[32.44px] overflow-clip p-[15px] rounded-[62.5px] top-[29.64px]">
                    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                      <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
                        <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[20px]">
                          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                            <g>
                              <path d={svgPaths.p9e36b00} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p26b59700} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p37502200} fill="var(--fill-0, black)" />
                              <path d={svgPaths.pa96a840} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p31e30b30} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p39e72880} fill="var(--fill-0, black)" />
                              <path d={svgPaths.pc7d0100} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p5e5a2c0} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p1bad0100} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p25291500} fill="var(--fill-0, black)" />
                              <path d={svgPaths.p37e9c4f2} fill="var(--fill-0, black)" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pricing */}
                <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[14.49px] shrink-0" style={{ backgroundColor: 'var(--color-primary-default)' }}>
                  <div className="size-full">
                    <div className="box-border content-stretch flex flex-col items-start justify-between not-italic pb-[33.91px] pl-[34.423px] pr-[10.87px] pt-[27.98px] relative size-full text-nowrap" style={{ color: 'var(--color-text-inverse)' }}>
                      <div className="flex flex-col justify-center relative shrink-0" style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-4xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        lineHeight: '60px'
                      }}>
                        <p className="text-nowrap whitespace-pre">Free</p>
                      </div>
                      <div className="flex flex-col justify-center relative shrink-0" style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        lineHeight: '30px'
                      }}>
                        <p className="text-nowrap whitespace-pre">to start</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Values Section
function MobileValuesSection({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div className="lg:hidden relative shrink-0 w-full">
      <div className="flex flex-col items-center size-full">
        <div className="box-border content-stretch flex flex-col items-center px-[20px] py-[40px] relative w-full">
          <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-[350px]">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="box-border content-stretch flex flex-col items-center pb-[0.81px] pt-0 px-0 relative shrink-0 w-full">
                <div className="flex flex-col justify-center leading-[42px] not-italic relative shrink-0 text-center w-full" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  <p>Our Values</p>
                </div>
              </div>
            </div>
            
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
              {/* Professional Excellence Card */}
              <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[16px] relative rounded-[14.49px] shrink-0 w-[350px]" style={{ backgroundColor: 'var(--color-primary-default)' }}>
                <div className="h-[72.47px] relative shrink-0 w-[234.61px]">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="Professional psychologists" className="absolute h-full left-[2.62%] max-w-none top-0 w-[94.75%]" src={img65311A1293B6F8535F54F4DdPeersHomePsychologenP500Avif} />
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[25px] not-italic relative shrink-0 w-full" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-inverse)'
                  }}>
                    <p className="mb-0">Professional Excellence &</p>
                    <p className="mb-0">Evidence-Based Care</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[21px] not-italic relative shrink-0 w-full" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-inverse)'
                  }}>
                    <p>iKan provides professional support and creates an environment of understanding and appreciation.</p>
                  </div>
                </div>
                <button 
                  onClick={onGetStarted}
                  className="ikan-button mobile-button touch-target cursor-pointer hover:opacity-90 transition-all duration-200 w-full"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-inverse)',
                    border: '1px solid #d9e1cf',
                    borderRadius: 'var(--radius-sm)',
                    height: '48px',
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Discover our programs
                </button>
              </div>
              
              {/* Digital Access Card */}
              <div className="box-border content-stretch flex flex-col items-start justify-center pb-0 pt-[16px] px-[16px] relative rounded-[14.49px] shrink-0 w-[350px]" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[25px] not-italic relative shrink-0 w-full" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)'
                  }}>
                    <p className="mb-0">Wherever you are, iKan is 100% digital and always</p>
                    <p>there for you.</p>
                  </div>
                </div>
                <div className="h-[250px] relative shrink-0 w-full">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img alt="iKan mobile app" className="absolute h-[94.99%] left-[3.83%] max-w-none top-[9.45%] w-[87.65%]" src={img65311A7Ca1Ba6B4628668B29PeersHomeIphoneScreenMockupP500Avif} />
                  </div>
                </div>
              </div>
              
              {/* Safety Card */}
              <div className="box-border content-stretch flex flex-col gap-[12px] items-start p-[16px] relative rounded-[14.49px] shrink-0 w-[350px]">
                <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[14.49px]" style={{ borderColor: 'var(--color-border-default)' }} />
                <div className="bg-neutral-100 box-border content-stretch flex gap-[6.25px] items-center justify-center overflow-clip p-[15px] relative rounded-[62.5px] shrink-0">
                  <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative">
                      <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[20px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                          <g>
                            <path d={svgPathsMobile.p9e36b00} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p26b59700} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p37502200} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.pa96a840} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p31e30b30} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p39e72880} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.pc7d0100} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p5e5a2c0} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p1bad0100} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p25291500} fill="var(--fill-0, black)" />
                            <path d={svgPathsMobile.p37e9c4f2} fill="var(--fill-0, black)" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[30px] not-italic relative shrink-0 w-full" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    <p>Safety First</p>
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                  <div className="flex flex-col justify-center leading-[24px] not-italic relative shrink-0 w-full" style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-regular)',
                    color: 'var(--color-text-muted)'
                  }}>
                    <p className="mb-0">Data security and confidentiality have</p>
                    <p>the highest priority for us.</p>
                  </div>
                </div>
              </div>
              
              {/* Pricing Card */}
              <div className="box-border content-stretch flex flex-col gap-[81.41px] items-start not-italic px-[16px] py-[30px] relative rounded-[14.49px] shrink-0 text-nowrap w-[350px]" style={{ 
                backgroundColor: 'var(--color-primary-default)',
                color: 'var(--color-text-inverse)'
              }}>
                <div className="flex flex-col justify-center relative shrink-0" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  lineHeight: '60px'
                }}>
                  <p className="text-nowrap whitespace-pre">Free</p>
                </div>
                <div className="flex flex-col justify-center relative shrink-0" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  lineHeight: '30px'
                }}>
                  <p className="text-nowrap whitespace-pre">to start</p>
                </div>
              </div>
            </div>
            
            <div className="content-stretch flex flex-col gap-[27.17px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex flex-col gap-[8px] items-start justify-center relative shrink-0 w-full">
                {[
                  'Start your journey today',
                  '96% recommendation rate', 
                  'Short waiting time'
                ].map((feature, index) => (
                  <div key={index} className="h-[19.39px] relative shrink-0">
                    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 pr-[157.97px] py-[3.695px] top-0 w-[169.97px]">
                      <div className="relative shrink-0 size-[12px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                          <g>
                            <path d={svgPathsMobile.p1d812c00} fill="var(--fill-0, #545457)" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute flex flex-col justify-center leading-[18px] left-[17.92px] not-italic text-nowrap top-[9.5px] translate-y-[-50%]" style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-muted)'
                    }}>
                      <ul>
                        <li className="list-disc ms-[18px]">
                          <span>{feature}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Team Section
function DesktopTeamSection({ onTeamMemberClick }: { onTeamMemberClick?: (member: typeof ABOUT_CONTENT.team[0]) => void }) {

  return (
    <div className="hidden lg:block box-border content-stretch flex flex-col gap-[48px] items-start justify-center px-0 py-[100px] relative shrink-0 w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="box-border content-stretch flex items-center px-[100px] py-[10px] relative w-full">
            <p className="leading-[60px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>Our Team</p>
          </div>
        </div>
      </div>
      
      <div className="h-[744px] relative shrink-0 w-full">
        <div className="size-full">
          <div className="box-border gap-[24px] grid grid-cols-[repeat(4,_minmax(0px,_1fr))] grid-rows-[repeat(2,_minmax(0px,_1fr))] h-[744px] px-[100px] py-0 relative w-full">
            {ABOUT_CONTENT.team.map((member, index) => (
              <button 
                key={member.id} 
                onClick={() => onTeamMemberClick?.(member)}
                className={`[grid-area:${Math.floor(index/4) + 1}_/_${(index % 4) + 1}] relative rounded-[16px] self-start shrink-0 cursor-pointer hover:shadow-md transition-all duration-200 touch-target`}
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
                aria-label={`Learn more about ${member.name}, ${member.role}`}
              >
                <div className="flex flex-row items-center size-full">
                  <div className="box-border content-stretch flex gap-[10px] items-center p-[16px] relative w-full">
                    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
                      <div className="h-[224px] relative rounded-[16px] shrink-0 w-full">
                        <img alt={`${member.name} - ${member.role}`} className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[16px] size-full" src={member.image} />
                      </div>
                      <div className="relative shrink-0 w-full">
                        <div className="flex flex-col justify-center size-full">
                          <div className="box-border content-stretch flex flex-col gap-[4px] items-start justify-center pl-[10px] pr-0 py-0 relative w-full">
                            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full">
                              <p className="leading-[24px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
                                fontFamily: 'var(--font-family-base)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)'
                              }}>{member.name}</p>
                              <div style={{ backgroundColor: 'var(--color-primary-default)' }} className="h-[2px] shrink-0 w-[28px]" />
                              <p className="leading-[18px] min-w-full not-italic relative shrink-0" style={{ 
                                width: "min-content",
                                fontFamily: 'var(--font-family-base)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-weight-regular)',
                                color: 'var(--color-text-muted)'
                              }}>
                                {member.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Team Section  
function MobileTeamSection({ onTeamMemberClick }: { onTeamMemberClick?: (member: typeof ABOUT_CONTENT.team[0]) => void }) {

  return (
    <div className="lg:hidden box-border content-stretch flex flex-col gap-[24px] items-start justify-center px-0 py-[40px] relative shrink-0 w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="relative shrink-0 w-full">
        <div className="flex flex-row items-center size-full">
          <div className="box-border content-stretch flex items-center px-[20px] py-[10px] relative w-full">
            <p className="leading-[42px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>Our Team</p>
          </div>
        </div>
      </div>
      
      <div className="relative shrink-0 w-full">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-[20px] py-0 relative w-full">
            {ABOUT_CONTENT.team.map((member, index) => (
              <button 
                key={member.id} 
                onClick={() => onTeamMemberClick?.(member)}
                className="relative rounded-[16px] shrink-0 w-full cursor-pointer hover:shadow-md transition-all duration-200 touch-target"
                style={{ backgroundColor: 'var(--color-bg-muted)' }}
                aria-label={`Learn more about ${member.name}, ${member.role}`}
              >
                <div className="flex flex-row items-center size-full">
                  <div className="box-border content-stretch flex gap-[10px] items-center p-[16px] relative w-full">
                    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
                      <div className="h-[224px] relative rounded-[16px] shrink-0 w-full">
                        <img alt={`${member.name} - ${member.role}`} className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[16px] size-full" src={member.image} />
                      </div>
                      <div className="relative shrink-0 w-full">
                        <div className="flex flex-col justify-center size-full">
                          <div className="box-border content-stretch flex flex-col gap-[4px] items-start justify-center pl-[10px] pr-0 py-0 relative w-full">
                            <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0 w-full">
                              <p className="leading-[24px] not-italic relative shrink-0 text-nowrap whitespace-pre" style={{
                                fontFamily: 'var(--font-family-base)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--color-text-primary)'
                              }}>{member.name}</p>
                              <div style={{ backgroundColor: 'var(--color-primary-default)' }} className="h-[2px] shrink-0 w-[28px]" />
                              <p className="leading-[18px] min-w-full not-italic relative shrink-0" style={{ 
                                width: "min-content",
                                fontFamily: 'var(--font-family-base)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-weight-regular)',
                                color: 'var(--color-text-muted)'
                              }}>
                                {member.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Resource Section - Using reusable ResourceBlock
function DesktopResourceSection({ onResourceClick, onReadMore }: { 
  onResourceClick?: (resourceId: string) => void;
  onReadMore?: () => void;
}) {
  const resourcePosts = getLatestResourcePosts(3);
  
  const handlePostClick = (post: any) => {
    if (onResourceClick) {
      onResourceClick(post.id);
    }
  };

  return (
    <div className="hidden lg:block">
      <ResourceBlock 
        title="Latest Updates"
        description="Insights and resources for your mental wellness journey"
        posts={resourcePosts}
        onPostClick={handlePostClick}
        onViewAll={onReadMore}
        viewAllText="View All"
      />
    </div>
  );
}

// Mobile Resource Section - Using reusable ResourceBlock
function MobileResourceSection({ onResourceClick, onReadMore }: { 
  onResourceClick?: (resourceId: string) => void;
  onReadMore?: () => void;
}) {
  const resourcePosts = getLatestResourcePosts(3);
  
  const handlePostClick = (post: any) => {
    if (onResourceClick) {
      onResourceClick(post.id);
    }
  };

  return (
    <div className="lg:hidden">
      <ResourceBlock 
        title="Latest Updates"
        description="Insights and resources for your mental wellness journey"
        posts={resourcePosts}
        onPostClick={handlePostClick}
        onViewAll={onReadMore}
        viewAllText="View All Articles"
      />
    </div>
  );
}

// Desktop Newsletter Section
function DesktopNewsletterSection({ 
  email, 
  name, 
  loading, 
  onEmailChange, 
  onNameChange, 
  onSubmit 
}: { 
  email: string;
  name: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="hidden lg:block">
      <NewsletterBlock
        title="Sign up for our Newsletter"
        benefits={[
          "Get weekly mental health tips, wellness resources, and stay updated with the latest news from iKan."
        ]}
        imageUrl={imgNewsletterCommunity}
        imageAlt="Mental health newsletter community"
        privacyText="Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time."
        ctaText={loading ? 'Signing up...' : 'Sign up now!'}
        onSubmit={(data) => {
          onEmailChange(data.email);
          const event = new Event('submit', { bubbles: true, cancelable: true }) as any;
          event.preventDefault = () => {};
          onSubmit(event);
        }}
      />
    </div>
  );
}

// Mobile Newsletter Section
function MobileNewsletterSection({ 
  email, 
  name, 
  loading, 
  onEmailChange, 
  onNameChange, 
  onSubmit 
}: { 
  email: string;
  name: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="lg:hidden relative shrink-0 w-full" style={{ backgroundColor: 'var(--color-bg-card)' }}>
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start justify-center px-[20px] py-[40px] relative w-full">
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[350px]">
            <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <div className="flex flex-col justify-center leading-[30px] not-italic relative shrink-0 w-full" style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  <p>Sign up for our Newsletter</p>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                {[
                  'Mental Health News & Tips',
                  'Wellness Resources & Tools'
                ].map((feature, index) => (
                  <div key={index} className="h-[19.39px] relative shrink-0">
                    <div className="absolute box-border content-stretch flex flex-col h-[19.39px] items-start justify-center left-0 overflow-clip pl-0 py-[3.695px] top-0">
                      <div className="relative shrink-0 size-[12px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                          <g>
                            <path d={svgPathsMobile.p1d812c00} fill="var(--fill-0, #545457)" />
                          </g>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute flex flex-col justify-center leading-[18px] left-[17.92px] not-italic text-nowrap top-[9.5px] translate-y-[-50%]" style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-regular)',
                      color: 'var(--color-text-primary)'
                    }}>
                      <ul>
                        <li className="list-disc ms-[18px]">
                          <span>{feature}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={onSubmit} className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
              <div className="relative shrink-0 w-full">
                <div className="flex flex-col items-center size-full">
                  <div className="box-border content-stretch flex flex-col gap-[16px] items-center pl-0 pr-[0.01px] py-0 relative w-full">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => onNameChange(e.target.value)}
                      placeholder="First Name"
                      className="ikan-input w-full"
                      style={{ height: '48px' }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="Email Address"
                      required
                      className="ikan-input w-full"
                      style={{ height: '48px' }}
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="ikan-button mobile-button touch-target cursor-pointer hover:opacity-90 transition-all duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-primary-default)',
                  color: 'var(--color-primary-on)',
                  borderRadius: 'var(--radius-sm)',
                  height: '48px',
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {loading ? 'Signing up...' : 'Sign up now!'}
              </button>
            </form>
          </div>
          
          <div className="h-[350px] relative rounded-[16px] shrink-0 w-full">
            <img alt="Mental health newsletter community" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[16px] size-full" src={imgNewsletterCommunity} />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="h-[350px] w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic content configurations
const ABOUT_CONTENT = {
  hero: {
    title: "About iKan",
    description: "iKan provides fast and effective mental health support, without long waiting times. In small groups, guided by experienced psychologists. Discrete, digital and empathetic. For finally more wellbeing, resilience and inner satisfaction in your life.",
    features: [
      'Start your journey today',
      'Expert guidance', 
      'Evidence-based approach'
    ]
  },
  mission: {
    title: "Our Mission",
    description: "We believe mental health support should be accessible, effective, and empowering. Our evidence-based approach combines the latest research with compassionate care to help you build lasting resilience and wellbeing."
  },
  services: [
    {
      title: 'Mood Tracking & Journal',
      description: 'Track your daily mood patterns and journal your thoughts to gain insights into your mental wellness journey.',
      image: imgReasons1S4Foms
    },
    {
      title: 'Professional Assessment', 
      description: 'Receive comprehensive mental health assessments from qualified professionals to understand your needs.',
      image: imgReasons2Souf7K
    },
    {
      title: 'Equip Programs',
      description: 'Access structured mental health programs designed to build resilience and coping strategies.',
      image: imgReasons2Zmn7Mt
    }
  ],
  values: [
    {
      title: 'Professional Excellence & Evidence-Based Care',
      description: 'iKan provides professional support and creates an environment of understanding and appreciation.',
      features: ['Professionally trained mental health experts', 'Evidence-based research', 'Clinically proven methods']
    },
    {
      title: 'Accessibility & Digital Innovation',
      description: 'Wherever you are, iKan is 100% digital and always there for you.',
      features: ['Available 24/7', 'Mobile-optimized platform', 'Secure and private']
    },
    {
      title: 'Safety & Security',
      description: 'Data security and confidentiality have the highest priority for us.',
      features: ['HIPAA compliant', 'End-to-end encryption', 'Professional standards']
    }
  ],
  team: Array(8).fill(null).map((_, index) => ({
    id: `team-${index}`,
    name: `Dr. ${['Sarah Chen', 'Michael Torres', 'Emily Rodriguez', 'David Kim', 'Lisa Thompson', 'James Wilson', 'Maria Garcia', 'Robert Johnson'][index]}`,
    role: ['Chief Clinical Officer', 'Senior Psychologist', 'Mental Health Counselor', 'Research Director', 'Therapy Specialist', 'Wellness Coach', 'Program Manager', 'Clinical Supervisor'][index],
    image: imgRectangle240648987
  })),
  resource: [
    {
      id: 'building-resilience',
      title: 'Building Resilience',
      description: 'Practical strategies to strengthen your mental wellness foundation and develop lasting coping skills.',
      date: 'February 26 2025',
      image: imgDtsFitnessAllieLehmanPhotosId1797CopyWebp,
      category: 'Mental Health'
    },
    {
      id: 'mind-body-connection',
      title: 'The Mind-Body Connection',
      description: 'How nutrition and lifestyle choices impact your mental wellness and overall wellbeing.',
      date: 'February 06 2025', 
      image: imgFireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg,
      category: 'Wellness'
    },
    {
      id: 'importance-of-rest',
      title: 'The Importance of Rest',
      description: 'Understanding why quality sleep and recovery are essential for mental health and emotional balance.',
      date: 'February 02 2025',
      image: imgDtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp,
      category: 'Sleep & Recovery'
    }
  ]
};

interface AboutUsProps {
  onNavigate?: (route: string, resourceId?: string) => void;
  onGetStarted?: () => void;
  className?: string;
}

export function AboutUs({ onNavigate, onGetStarted, className }: AboutUsProps) {
  const isMobile = useIsMobile();
  const { showToast } = useNotifications();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Navigation handlers
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (onNavigate) {
      onNavigate('/assessment-landing');
    }
  };

  const handleVideoPlay = () => {
    setShowVideoModal(true);
    showToast('info', 'Video Player', 'Opening video in new window...');
    // In a real app, this would open a video player
    setTimeout(() => {
      window.open('https://youtube.com/watch?v=example', '_blank');
      setShowVideoModal(false);
    }, 1000);
  };

  const handleResourceNavigation = (resourceId: string) => {
    // Resource detail pages aren't implemented yet, so navigate to Library instead
    // In the future, this could navigate to a dedicated resource detail page
    if (onNavigate) {
      showToast('info', 'Mental Health Resources', 'View more articles and resources in our Library');
      onNavigate('/library');
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      showToast('error', 'Email Required', 'Please enter your email address');
      return;
    }

    setNewsletterLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast('success', 'Newsletter Subscription', `Welcome ${newsletterName || 'to our community'}! You've been subscribed to our newsletter.`);
      setNewsletterEmail('');
      setNewsletterName('');
    } catch (error) {
      showToast('error', 'Subscription Failed', 'Please try again later');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleTeamMemberClick = (member: typeof ABOUT_CONTENT.team[0]) => {
    showToast('info', member.name, `Learn more about our ${member.role}`);
  };

  const handleServiceClick = (service: typeof ABOUT_CONTENT.services[0]) => {
    if (onNavigate) {
      // Navigate to appropriate service page
      const routeMap: { [key: string]: string } = {
        'Mood Tracking & Journal': '/mood-journal',
        'Professional Assessment': '/assessment-landing',
        'Equip Programs': '/equip-programs-landing'
      };
      const route = routeMap[service.title];
      if (route) {
        onNavigate(route);
      }
    }
  };

  return (
    <div className={`min-h-screen w-full ${className || ''}`} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header - Responsive */}
      <DesktopHeader onGetStarted={handleGetStarted} />
      <MobileHeader onGetStarted={handleGetStarted} />
      
      {/* Mission - Responsive */} 
      <DesktopMissionSection onVideoPlay={handleVideoPlay} />
      <MobileMissionSection onVideoPlay={handleVideoPlay} />
      
      {/* What We Do - Responsive */}
      <DesktopWhatWeDoSection onServiceClick={handleServiceClick} />
      <MobileWhatWeDoSection onServiceClick={handleServiceClick} />
      
      {/* Values - Responsive */}
      <DesktopValuesSection onGetStarted={handleGetStarted} />
      <MobileValuesSection onGetStarted={handleGetStarted} />
      
      {/* Team - Responsive */}
      <DesktopTeamSection onTeamMemberClick={handleTeamMemberClick} />
      <MobileTeamSection onTeamMemberClick={handleTeamMemberClick} />
      
      {/* Resources - Responsive */}
      <DesktopResourceSection onResourceClick={handleResourceNavigation} onReadMore={() => onNavigate?.('/library')} />
      <MobileResourceSection onResourceClick={handleResourceNavigation} onReadMore={() => onNavigate?.('/library')} />
      
      {/* Newsletter - Responsive */}
      <DesktopNewsletterSection 
        email={newsletterEmail}
        name={newsletterName}
        loading={newsletterLoading}
        onEmailChange={setNewsletterEmail}
        onNameChange={setNewsletterName}
        onSubmit={handleNewsletterSubmit}
      />
      <MobileNewsletterSection 
        email={newsletterEmail}
        name={newsletterName}
        loading={newsletterLoading}
        onEmailChange={setNewsletterEmail}
        onNameChange={setNewsletterName}
        onSubmit={handleNewsletterSubmit}
      />
      
      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
            <div className="animate-spin mb-4 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
            <p style={{ color: 'var(--color-text-primary)' }}>Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
}