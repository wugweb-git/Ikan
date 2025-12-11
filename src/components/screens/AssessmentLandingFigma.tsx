import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '../ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { getAssessmentContent, AssessmentLandingContent } from '../../lib/assessment-landing-content';
import svgPaths from "../../imports/svg-gakolt7l9n";
import imgAvatar from "figma:asset/f8bfdc3dfe2a754ded4c44d82d1518e16a087140.png";
import imgFrame1000007576 from "figma:asset/ec350e2018bda2d47f0402ba62630ee1c724131f.png";
import imgRectangle6552 from "figma:asset/33ab82a4b2f27e9bfed344f5fb487a8cc4269c24.png";
import imgFrame1000007589 from "figma:asset/cb06db12ebd975528638b96c5da71618d983aac7.png";
import Frame1000007592Enhanced from "../../imports/Frame1000007592Enhanced";

interface AssessmentLandingFigmaProps {
  onStartAssessment?: () => void;
  onBack?: () => void;
}

// Get stored assessment data
const getStoredAssessment = () => {
  try {
    const stored = localStorage.getItem('ikan-selected-assessment');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function Logo() {
  return (
    <div className="h-[50px] relative shrink-0 w-[100px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 50">
        <g id="Logo">
          <g id="Vector">
            <path d={svgPaths.p28d7740} fill="var(--fill-0, black)" />
            <path d={svgPaths.p201d5680} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2febba00} fill="var(--fill-0, black)" />
            <path d={svgPaths.p2be28440} fill="var(--fill-0, black)" />
            <path d={svgPaths.p1c12f8f0} fill="var(--fill-0, black)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function LinkMargin() {
  return (
    <div className="box-border content-stretch flex flex-col h-[90px] items-start px-0 relative shrink-0" data-name="Link:margin" style={{ paddingTop: 'var(--spacing-5)', paddingBottom: 'var(--spacing-5)' }}>
      <Logo />
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex h-[20px] items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Home</p>
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Buttons2() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Assessments</p>
      </div>
    </div>
  );
}

function Buttons3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Equips</p>
      </div>
    </div>
  );
}

function Buttons4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Mood Journal</p>
      </div>
    </div>
  );
}

function Buttons5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Consultation</p>
      </div>
    </div>
  );
}

function Buttons6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Buttons" style={{ gap: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-center text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Library</p>
      </div>
    </div>
  );
}

function Menubar() {
  return (
    <div className="content-stretch flex h-[21px] items-center relative shrink-0" data-name="Menubar" style={{ gap: 'var(--spacing-8)' }}>
      <Buttons />
      <Buttons1 />
      <Buttons2 />
      <Buttons3 />
      <Buttons4 />
      <Buttons5 />
      <Buttons6 />
    </div>
  );
}

function FullMenuMargin() {
  return (
    <div className="box-border content-stretch flex flex-col items-start pr-0 py-0 relative shrink-0" data-name="full-menu:margin" style={{ paddingLeft: 'calc(var(--spacing-4) * 3)' }}>
      <Menubar />
    </div>
  );
}

function Container() {
  return (
    <div className="basis-0 content-stretch flex grow items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <LinkMargin />
      <FullMenuMargin />
    </div>
  );
}

function Buttons7({ onStartAssessment }: { onStartAssessment?: () => void }) {
  return (
    <div 
      className="box-border content-stretch flex items-center relative shrink-0 cursor-pointer hover:bg-[#dddde3] transition-colors" 
      data-name="Buttons"
      onClick={onStartAssessment}
      style={{
        backgroundColor: 'var(--color-accent-default)',
        gap: 'var(--spacing-2)',
        paddingLeft: 'var(--spacing-5)',
        paddingRight: 'var(--spacing-5)',
        paddingTop: 'var(--spacing-3)',
        paddingBottom: 'var(--spacing-3)',
        borderRadius: 'var(--radius-sm)'
      }}
    >
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-accent-on)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Let's Talk</p>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="AVATAR">
      <img alt="" className="block max-w-none size-full" height="48" src={imgAvatar} width="48" />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex gap-[8.889px] items-center relative shrink-0 size-[48px]">
      <Avatar />
    </div>
  );
}

function Container1({ onStartAssessment }: { onStartAssessment?: () => void }) {
  return (
    <div className="content-start flex flex-wrap items-start relative shrink-0" data-name="Container" style={{ gap: 'var(--spacing-4)' }}>
      <Buttons7 onStartAssessment={onStartAssessment} />
      <Frame23 />
    </div>
  );
}

function Container2({ onStartAssessment }: { onStartAssessment?: () => void }) {
  return (
    <div className="content-stretch flex h-[88px] items-center justify-between relative shrink-0 w-[1352px]" data-name="Container">
      <Container />
      <Container1 onStartAssessment={onStartAssessment} />
    </div>
  );
}

function TopNavigation({ onStartAssessment }: { onStartAssessment?: () => void }) {
  return (
    <div className="hidden" data-name="Top Navigation">
      {/* Custom navigation hidden - using standard TopNavBar instead */}
    </div>
  );
}

function Frame1000007577({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full" style={{ gap: 'var(--spacing-4)' }}>
      <div className="flex flex-col justify-center relative shrink-0 w-full" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', fontSize: 'clamp(var(--text-2xl), 4vw, var(--text-4xl))' }}>
        <p className="leading-[1.2]">{content.title}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)', fontSize: 'clamp(var(--text-sm), 2vw, var(--text-base))' }}>
        <p style={{ lineHeight: 'var(--line-height-md)' }}>{content.description}</p>
      </div>
    </div>
  );
}

function Buttons8({ onStartAssessment, onOpenModal }: { onStartAssessment?: () => void; onOpenModal?: () => void }) {
  return (
    <div 
      className="box-border content-stretch flex items-center relative shrink-0 cursor-pointer hover:bg-[#3a3a3f] transition-colors" 
      data-name="Buttons"
      onClick={onOpenModal}
      style={{
        backgroundColor: 'var(--color-primary-default)',
        gap: 'var(--spacing-2)',
        paddingLeft: 'var(--spacing-5)',
        paddingRight: 'var(--spacing-5)',
        paddingTop: 'var(--spacing-3)',
        paddingBottom: 'var(--spacing-3)',
        borderRadius: 'var(--radius-sm)'
      }}
    >
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary-on)', fontSize: 'var(--text-sm)' }}>
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Take Assessment</p>
      </div>
    </div>
  );
}

function Frame1000007575({ onStartAssessment, onOpenModal, content }: { onStartAssessment?: () => void; onOpenModal?: () => void; content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full max-w-[546px]" style={{ gap: 'clamp(var(--spacing-6), 3vw, var(--spacing-8))' }}>
      <Frame1000007577 content={content} />
      <Buttons8 onStartAssessment={onStartAssessment} onOpenModal={onOpenModal} />
    </div>
  );
}

function Frame1000007576({ onStartAssessment, onOpenModal, content }: { onStartAssessment?: () => void; onOpenModal?: () => void; content: AssessmentLandingContent }) {
  return (
    <div className="h-screen relative w-full">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgFrame1000007576} />
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col h-full items-start justify-center relative w-full" style={{ gap: 'var(--spacing-3)', paddingLeft: '0', paddingRight: '0', paddingTop: 'clamp(calc(var(--spacing-4) * 7), 15vh, calc(var(--spacing-4) * 18))', paddingBottom: 'clamp(calc(var(--spacing-4) * 7), 15vh, calc(var(--spacing-4) * 18))' }}>
          <Frame1000007575 onStartAssessment={onStartAssessment} onOpenModal={onOpenModal} content={content} />
        </div>
      </div>
    </div>
  );
}

function Heading2({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 text-nowrap" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', fontSize: 'var(--text-4xl)' }}>
        <p style={{ lineHeight: 'var(--line-height-sm)' }} className="whitespace-pre">{content.about?.title || "About"}</p>
      </div>
    </div>
  );
}

function Margin({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 px-0 relative shrink-0 w-full" data-name="Margin" style={{ paddingTop: 'var(--spacing-2)' }}>
      <div className="flex flex-col justify-center leading-[0] not-italic relative shrink-0 w-full" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
        <p style={{ lineHeight: 'var(--line-height-md)' }}>{content.about?.description || "Thank you for taking the time to complete this assessment. Your mental health matters, and taking this step shows strength and self-awareness."}</p>
      </div>
    </div>
  );
}

function Frame40({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full lg:w-[400px]" style={{ gap: 'var(--spacing-2)' }}>
      <Heading2 content={content} />
      <Margin content={content} />
    </div>
  );
}

function Frame1000007579({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col lg:flex-row items-center relative shrink-0 w-full" style={{ gap: 'clamp(var(--spacing-6), 5vw, calc(var(--spacing-4) * 5))' }}>
      <Frame40 content={content} />
      <div className="basis-0 grow h-[300px] lg:h-[450px] min-h-px min-w-px relative shrink-0 w-full lg:w-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'var(--radius-lg)' }}>
          <img alt="" className="absolute h-full left-[-6.42%] max-w-none top-0 w-[106.29%]" src={imgRectangle6552} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007578({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="relative shrink-0 w-full bg-white">
      {/* Enhanced Section with Better Visual Hierarchy */}
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center px-[50px] md:px-[100px] py-[120px] md:py-[296px] relative w-full">
          {/* Main Content */}
          <Frame1000007579 content={content} />
          
          {/* Enhanced Assessment Journey Section with Better Visual Hierarchy */}
          <div className="w-full mt-16 space-y-12">
            {/* Key Features Section */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span 
                  className="text-sm font-medium text-[#2A2A2A]"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  Evidence-Based Assessment
                </span>
              </div>
              <h3 
                className="text-3xl font-semibold text-[#151515] leading-tight"
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                Why This Assessment Matters
              </h3>
              <p 
                className="text-lg text-[#757575] max-w-3xl mx-auto leading-relaxed"
                style={{
                  fontFamily: 'var(--font-family-base)',
                  fontSize: 'var(--text-lg)',
                  lineHeight: 'var(--line-height-lg)'
                }}
              >
                Our assessment is meticulously designed with your wellbeing and privacy as the top priority, providing you with meaningful insights in a safe, supportive environment.
              </p>
            </div>

            {/* Enhanced Features Grid with Content-Related Imagery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Feature 1 - Privacy First */}
              <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
                  <img 
                    src="https://images.unsplash.com/photo-1758738880382-d614a6ecdc4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMG1pbmRmdWxuZXNzJTIwbWVkaXRhdGlvbiUyMHBlYWNlZnVsfGVufDF8fHx8MTc1OTMwMzkzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Privacy and mindfulness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 
                  className="text-xl font-semibold text-[#151515] mb-3"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  Privacy Protected
                </h4>
                <p 
                  className="text-base text-[#757575] leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  Your responses are completely anonymous and secure. We never store personal information or track individual responses.
                </p>
              </div>

              {/* Feature 2 - Science-Based */}
              <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-teal-50 rounded-2xl p-8 border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
                  <img 
                    src="https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXB5JTIwY291bnNlbGluZyUyMHN1cHBvcnQlMjBtZW50YWwlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NTkzMDExNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Professional guidance"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11H7a2 2 0 00-2 2v7a2 2 0 002 2h2a2 2 0 002-2v-7a2 2 0 00-2-2zM17 9h-2a2 2 0 00-2 2v9a2 2 0 002 2h2a2 2 0 002-2v-9a2 2 0 00-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 13V8a4 4 0 018 0v5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 
                  className="text-xl font-semibold text-[#151515] mb-3"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  Evidence-Based
                </h4>
                <p 
                  className="text-base text-[#757575] leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  Built on validated psychological instruments and research-backed methodologies from leading mental health professionals.
                </p>
              </div>

              {/* Feature 3 - Instant Results */}
              <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
                  <img 
                    src="https://images.unsplash.com/photo-1758274526663-483cd2284954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwY2FyZSUyMHdlbGxuZXNzJTIwYWN0aXZpdGllcyUyMHBlYWNlZnVsfGVufDF8fHx8MTc1OTMwMzk1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Self care and wellness"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                    <path d="m12 6 0 6 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 
                  className="text-xl font-semibold text-[#151515] mb-3"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  Instant Insights
                </h4>
                <p 
                  className="text-base text-[#757575] leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  Get your results immediately with personalized recommendations, resources, and actionable next steps.
                </p>
              </div>
            </div>

            {/* Assessment Process Flow */}
            <div className="relative max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h4 
                  className="text-2xl font-semibold text-[#151515] mb-4"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  Your Assessment Journey
                </h4>
                <p 
                  className="text-base text-[#757575] max-w-2xl mx-auto"
                  style={{
                    fontFamily: 'var(--font-family-base)',
                    fontSize: 'var(--text-base)',
                    lineHeight: 'var(--line-height-md)'
                  }}
                >
                  A simple, guided process designed to provide you with meaningful insights about your mental health.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Step 1 */}
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span 
                      className="text-2xl font-bold text-white"
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      1
                    </span>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h5 
                    className="text-lg font-medium text-[#151515]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Begin Assessment
                  </h5>
                  <p 
                    className="text-sm text-[#757575]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    Answer questions honestly about your recent experiences
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span 
                      className="text-2xl font-bold text-white"
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      2
                    </span>
                  </div>
                  <h5 
                    className="text-lg font-medium text-[#151515]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Analysis
                  </h5>
                  <p 
                    className="text-sm text-[#757575]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    Our system analyzes your responses using evidence-based algorithms
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <span 
                      className="text-2xl font-bold text-white"
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      3
                    </span>
                  </div>
                  <h5 
                    className="text-lg font-medium text-[#151515]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Results
                  </h5>
                  <p 
                    className="text-sm text-[#757575]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    Receive your personalized results with detailed explanations
                  </p>
                </div>

                {/* Step 4 */}
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span 
                      className="text-2xl font-bold text-white"
                      style={{
                        fontFamily: 'var(--font-family-base)',
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-bold)'
                      }}
                    >
                      4
                    </span>
                  </div>
                  <h5 
                    className="text-lg font-medium text-[#151515]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    Next Steps
                  </h5>
                  <p 
                    className="text-sm text-[#757575]"
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    Access resources and recommendations tailored to your needs
                  </p>
                </div>
              </div>

              {/* Connection Line */}
              <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-orange-200 to-purple-200 -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading3({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">{content.whatIsIt.title}</p>
      </div>
    </div>
  );
}

function Margin1({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px] mb-0">{content.whatIsIt.description}</p>
        <ul className="css-ed5n1g list-disc mb-0">
          {content.whatIsIt.bulletPoints.map((point, index) => (
            <li key={index} className="mb-0 ms-[24px]">
              <span className="leading-[24px]">{point}</span>
            </li>
          ))}
        </ul>
        <p className="leading-[24px]">Your answers and your result are anonymous. You can decide what you want to do with your result. We'll give you some recommendations to get you started.</p>
      </div>
    </div>
  );
}

function Frame41({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative lg:rounded-bl-[40px] lg:rounded-tl-[40px] shrink-0">
      <div aria-hidden="true" className="absolute border-[#d5d5d5] lg:border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none lg:rounded-bl-[40px] lg:rounded-tl-[40px]" />
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start justify-center px-0 lg:px-[100px] py-0 relative w-full">
          <Heading3 content={content} />
          <Margin1 content={content} />
        </div>
      </div>
    </div>
  );
}

function Heading4({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">{content.whatHappens.title}</p>
      </div>
    </div>
  );
}

function Margin2({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <ul className="css-ed5n1g list-disc mb-0">
          {content.whatHappens.bulletPoints.map((point, index) => (
            <li key={index} className="mb-0 ms-[24px]">
              <span className="leading-[24px]">{point}</span>
            </li>
          ))}
        </ul>
        <p className="leading-[24px]">{content.whatHappens.additionalInfo}</p>
      </div>
    </div>
  );
}

function Frame1000007581({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative lg:rounded-br-[40px] lg:rounded-tr-[40px] self-stretch shrink-0">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start px-0 lg:px-[100px] py-0 relative size-full">
          <Heading4 content={content} />
          <Margin2 content={content} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007580({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col lg:flex-row items-start px-[50px] md:px-[100px] py-[120px] md:py-[296px] relative w-full gap-[24px] lg:gap-0 overflow-hidden">
          {/* Background Media Elements */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 blur-xl"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-blue-100 blur-lg"></div>
          </div>
          
          {/* Enhanced Content Container */}
          <div className="relative z-10 w-full flex flex-col lg:flex-row gap-[24px] lg:gap-0">
            {/* Left Section with Media */}
            <div className="flex-1 relative">
              <Frame41 content={content} />
              
              {/* Floating Media Element */}
              <div className="hidden lg:block absolute -top-6 -left-6 w-16 h-16 rounded-full overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1758274538961-fe8f1f24166f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMG1lZGl0YXRpb24lMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NTkzMDExNzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Wellness meditation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Interactive Divider */}
            <div className="hidden lg:flex items-center justify-center w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent relative mx-8">
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Right Section with Media */}
            <div className="flex-1 relative">
              <Frame1000007581 content={content} />
              
              {/* Floating Media Element */}
              <div className="hidden lg:block absolute -bottom-6 -right-6 w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXB5JTIwY291bnNlbGluZyUyMHN1cHBvcnQlMjBtZW50YWwlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NTkzMDExNzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Mental health support"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Media Strip */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>
          
          {/* Interactive Pulse Indicators */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame1000007588({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[48px] text-black w-full">
        <p className="leading-[60px]">Ready to answer the first question?</p>
      </div>
    </div>
  );
}

function Buttons9({ onStartAssessment }: { onStartAssessment?: () => void }) {
  return (
    <div 
      className="bg-[#2e2a2f] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#3a3a3f] transition-colors" 
      data-name="Buttons"
      onClick={onStartAssessment}
    >
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">Take Assessment</p>
      </div>
    </div>
  );
}

function Frame1000007586({ onStartAssessment, content }: { onStartAssessment?: () => void; content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-[550px]">
      <Frame1000007588 content={content} />
      <Buttons9 onStartAssessment={onStartAssessment} />
    </div>
  );
}

function Frame1000007589({ onStartAssessment, content }: { onStartAssessment?: () => void; content: AssessmentLandingContent }) {
  return (
    <div className="h-[450px] relative rounded-[40px] shrink-0 w-full">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[40px] size-full" src={imgFrame1000007589} />
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] h-[450px] items-start justify-center p-[50px] relative w-full">
          <Frame1000007586 onStartAssessment={onStartAssessment} content={content} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007587({ onStartAssessment, content }: { onStartAssessment?: () => void; content: AssessmentLandingContent }) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-start justify-center px-[50px] md:px-[100px] py-[120px] md:py-[296px] relative w-full">
          <Frame1000007589 onStartAssessment={onStartAssessment} content={content} />
        </div>
      </div>
    </div>
  );
}

function Heading5({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">{content.supportingInfo?.title || "Supporting someone else"}</p>
      </div>
    </div>
  );
}

function Margin3({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[0px] w-full">
        <p className="leading-[24px] text-[16px]">
          <span>
            {content.supportingInfo?.description || `This assessment is for individual self-reflection. If you're worried about someone else's mental health, visit our guide on supporting someone. This page has tips on how you can help them feel supported and seek mental health support and services.`}
          </span>
        </p>
      </div>
    </div>
  );
}

function Frame42({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-bl-[40px] rounded-tl-[40px] shrink-0">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start justify-center pl-0 pr-[40px] py-0 relative w-full">
          <Heading5 content={content} />
          <Margin3 content={content} />
        </div>
      </div>
    </div>
  );
}

function Heading6({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] w-full">
        <p className="leading-[50px]">{content.privacy.title}</p>
      </div>
    </div>
  );
}

function Margin4({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[0px] w-full">
        <p className="leading-[24px] text-[16px] whitespace-pre-wrap">
          <span>{content.privacy.description}</span>
        </p>
      </div>
    </div>
  );
}

function Frame1000007582({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative rounded-br-[40px] rounded-tr-[40px] self-stretch shrink-0">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start pl-[40px] pr-0 py-0 relative size-full">
          <Heading6 content={content} />
          <Margin4 content={content} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007591({ content }: { content: AssessmentLandingContent }) {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col lg:flex-row items-start px-[50px] md:px-[100px] py-[120px] md:py-[296px] relative w-full gap-[24px] lg:gap-0">
          <Frame42 content={content} />
          <Frame1000007582 content={content} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007590({ onStartAssessment, onOpenModal, content }: { onStartAssessment?: () => void; onOpenModal?: () => void; content: AssessmentLandingContent }) {
  return (
    <div className="w-full flex flex-col items-start">
      <Frame1000007576 onStartAssessment={onStartAssessment} onOpenModal={onOpenModal} content={content} />
      <Frame1000007578 content={content} />
      <Frame1000007580 content={content} />
      
      {/* Enhanced Figma Component with Content-Related Imagery */}
      <div className="w-full relative">
        <Frame1000007592Enhanced />
      </div>
      
      <Frame1000007587 onStartAssessment={onStartAssessment} content={content} />
      <Frame1000007591 content={content} />
    </div>
  );
}

export function AssessmentLandingFigma({ onStartAssessment, onBack }: AssessmentLandingFigmaProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<AssessmentLandingContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load assessment content based on stored assessment
  useEffect(() => {
    const storedAssessment = getStoredAssessment();
    if (storedAssessment && storedAssessment.slug) {
      const assessmentContent = getAssessmentContent(storedAssessment.slug);
      setContent(assessmentContent);
    } else {
      // Default to general wellbeing if no specific assessment selected
      setContent(getAssessmentContent('general-wellbeing'));
    }
  }, []);
  
  const handleStartAssessment = () => {
    // Store intent to start assessment
    const storedAssessment = getStoredAssessment();
    if (storedAssessment) {
      try {
        localStorage.setItem('ikan-start-assessment', JSON.stringify(storedAssessment));
      } catch (error) {
        console.warn('Could not store assessment start intent:', error);
      }
    }
    
    // Close modal and proceed to assessment
    setIsModalOpen(false);
    
    if (onStartAssessment) {
      onStartAssessment();
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Show loading state while content loads
  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-100 relative w-full min-h-screen" data-name="Assesment_LP">
      {/* Back Button for Mobile */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 p-2 h-auto bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-base)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      )}
      
      <TopNavigation onStartAssessment={handleOpenModal} />
      <Frame1000007590 onStartAssessment={handleStartAssessment} onOpenModal={handleOpenModal} content={content} />
      
      {/* Assessment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="max-w-md w-full mx-4 p-0 border-0 shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="p-6 space-y-6">
            {/* Assessment Description */}
            <DialogHeader className="space-y-4">
              <DialogTitle 
                className="sr-only"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)'
                }}
              >
                {content.title}
              </DialogTitle>
              <DialogDescription 
                className="text-left"
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  lineHeight: 'var(--line-height-md)',
                  fontWeight: 'var(--font-weight-normal)'
                }}
              >
                {content.whatIsIt.description}
              </DialogDescription>
            </DialogHeader>

            {/* Assessment Details */}
            <div className="space-y-4">
              {/* Category */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m8-14L4 7l8 4m8-4v10l-8 4m-8-4l8-4m-8 4V7" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    Category
                  </div>
                  <div 
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {content.slug === 'gad7' ? 'Anxiety' : content.slug === 'phq9' ? 'Depression' : content.slug === 'wellbeing' ? 'General Wellbeing' : 'Mental Health'}
                  </div>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#22C55E' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                    <path d="m12 6 0 6 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    Estimated Time
                  </div>
                  <div 
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {content.estimatedTime}
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-normal)'
                    }}
                  >
                    Questions
                  </div>
                  <div 
                    style={{
                      fontSize: 'var(--text-base)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      fontWeight: 'var(--font-weight-medium)'
                    }}
                  >
                    {content.questionCount} questions
                  </div>
                </div>
              </div>
            </div>

            {/* Before You Begin */}
            <div className="space-y-4">
              <h4 
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                Before You Begin:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-text-muted)' }}
                  />
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    Find a quiet place where you can focus without distractions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-text-muted)' }}
                  />
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    Answer honestly - there are no right or wrong answers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-text-muted)' }}
                  />
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    This assessment will take approximately {content.estimatedTime} to complete
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div 
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-text-muted)' }}
                  />
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-base)',
                      lineHeight: 'var(--line-height-md)'
                    }}
                  >
                    You can pause and resume the assessment later if needed
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-3) var(--spacing-4)'
                }}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleStartAssessment}
                className="flex-1 h-12 gap-2"
                style={{
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-base)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-3) var(--spacing-4)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="m3 18v-6l3-3 6 6 6-6 3 3v6z" 
                    fill="currentColor"
                  />
                  <path 
                    d="m3 18v-6l3-3 6 6 6-6 3 3v6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Start Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}