import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../ui/utils';
import { getEquipProgramContent, getStoredProgram, getDefaultEquipProgramContent, EquipProgramDetails } from '../../lib/equip-program-content';

// Import Figma assets from the new template
import svgPaths from "../../imports/svg-5ldzy59kd4";
import imgFrame1000007576 from "figma:asset/efa85e290b69314df59a76024b943a7bf04b3ca7.png";
import imgRectangle6552 from "figma:asset/33ab82a4b2f27e9bfed344f5fb487a8cc4269c24.png";
import imgFrame41 from "figma:asset/06b6061d4beed4d7bbdf642e22f43b571ad366f2.png";
import imgFrame1000007579 from "figma:asset/f6a79a7b44d0d218617bbcc2cdad890a1274ceac.png";
import imgFrame1000007589 from "figma:asset/d183615f7c03d3b176392af9d57469c47f8b23e3.png";

interface EquipProgramLandingFigmaProps {
  onStartProgram?: (programId: string) => void;
  onBack?: () => void;
}

// Hero Section Components
function Frame1000007577({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex flex-col items-start leading-[0] not-italic relative shrink-0 w-full" style={{ gap: 'var(--spacing-4)' }}>
      <div className="flex flex-col justify-center relative shrink-0 w-full" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-bold)', lineHeight: 'var(--line-height-xs)', color: 'var(--color-text-primary)', fontSize: 'clamp(var(--text-3xl), 5vw, var(--text-4xl))' }}>
        <p className="mb-0">{content.title}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full" style={{ fontFamily: 'var(--font-family-base)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
        <p style={{ lineHeight: 'var(--line-height-md)' }}>{content.overview.description}</p>
      </div>
    </div>
  );
}

function Buttons({ onStartProgram }: { onStartProgram?: () => void }) {
  return (
    <div 
      className="box-border content-stretch flex items-center relative shrink-0 cursor-pointer hover:bg-[#3a3a3f] transition-colors" 
      data-name="Buttons"
      onClick={onStartProgram}
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
        <p style={{ lineHeight: 'var(--line-height-lg)' }} className="whitespace-pre">Start Program</p>
      </div>
    </div>
  );
}

function Frame1000007575({ content, onStartProgram }: { content: EquipProgramDetails; onStartProgram?: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[546px]" style={{ gap: 'var(--spacing-8)' }}>
      <Frame1000007577 content={content} />
      <Buttons onStartProgram={onStartProgram} />
    </div>
  );
}

function Frame1000007576({ content, onStartProgram }: { content: EquipProgramDetails; onStartProgram?: () => void }) {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[900px] items-start justify-center left-0 px-[100px] py-[296px] rounded-bl-[80px] rounded-br-[80px] top-0 w-[1440px]">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-bl-[80px] rounded-br-[80px] size-full" src={imgFrame1000007576} />
      <Frame1000007575 content={content} onStartProgram={onStartProgram} />
    </div>
  );
}

// About Section Components
function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[48px] text-nowrap">
        <p className="leading-[60px] whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Margin({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px] whitespace-pre-wrap">{content.whatYoullGet.description}</p>
      </div>
    </div>
  );
}

function Frame40({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[400px]">
      <Heading2 />
      <Margin content={content} />
    </div>
  );
}

function Frame1000007579({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex gap-[80px] items-center relative shrink-0 w-full">
      <Frame40 content={content} />
      <div className="basis-0 grow h-[450px] min-h-px min-w-px relative shrink-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-[-6.42%] max-w-none top-0 w-[106.29%]" src={imgRectangle6552} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007578({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] items-start justify-center left-1/2 p-[100px] top-[900px] translate-x-[-50%] w-[1440px]">
      <Frame1000007579 content={content} />
    </div>
  );
}

// Two Column Section Components
function Heading3({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] text-nowrap">
        <p className="leading-[50px] whitespace-pre">{content.structure.title}</p>
      </div>
    </div>
  );
}

function Margin1({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <div className="space-y-4">
          {content.structure.weeks.map((week) => (
            <div key={week.week} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="leading-[24px] font-medium mb-1">Week {week.week}: {week.title}</p>
                <p className="leading-[24px] text-[14px]">{week.description}</p>
              </div>
            </div>
          ))}
          {content.structure.moreCount > 0 && (
            <p className="leading-[24px] text-[14px] opacity-70">...and {content.structure.moreCount} more</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Frame41({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="basis-0 grow h-[650px] min-h-px min-w-px relative rounded-bl-[40px] rounded-tl-[40px] shrink-0">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-bl-[40px] rounded-tl-[40px]">
        <div className="absolute bg-white inset-0 rounded-bl-[40px] rounded-tl-[40px]" />
        <div className="absolute inset-0 overflow-hidden rounded-bl-[40px] rounded-tl-[40px]">
          <img alt="" className="absolute h-[54.86%] left-[-3.46%] max-w-none top-[46.31%] w-[106.91%]" src={imgFrame41} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#dddddd] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none rounded-bl-[40px] rounded-tl-[40px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] h-[650px] items-start p-[100px] relative w-full">
          <Heading3 content={content} />
          <Margin1 content={content} />
        </div>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[40px] text-nowrap">
        <p className="leading-[50px] whitespace-pre">Program Details</p>
      </div>
    </div>
  );
}

function Margin2({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <div className="space-y-4">
          <div className="bg-[#F5F5F5] p-4 rounded-[12px]">
            <p className="leading-[24px] font-medium text-[#151515] mb-2">Duration</p>
            <p className="leading-[24px]">{content.programDetails.duration}</p>
          </div>
          <div className="bg-[#F5F5F5] p-4 rounded-[12px]">
            <p className="leading-[24px] font-medium text-[#151515] mb-2">Access Period</p>
            <p className="leading-[24px]">{content.programDetails.accessPeriod}</p>
          </div>
          <div className="bg-[#F5F5F5] p-4 rounded-[12px]">
            <p className="leading-[24px] font-medium text-[#151515] mb-2">Content</p>
            <p className="leading-[24px]">{content.programDetails.modules}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame1000007590({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="basis-0 grow h-[650px] min-h-px min-w-px relative rounded-br-[40px] rounded-tr-[40px] shrink-0">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-br-[40px] rounded-tr-[40px]">
        <div className="absolute bg-[#f7f7f7] inset-0 rounded-br-[40px] rounded-tr-[40px]" />
        <div className="absolute inset-0 overflow-hidden rounded-br-[40px] rounded-tr-[40px]">
          <img alt="" className="absolute h-[64.55%] left-[-2.29%] max-w-none top-[37.78%] w-[124.36%]" src={imgFrame1000007579} />
        </div>
      </div>
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] h-[650px] items-start p-[100px] relative w-full">
          <Heading4 />
          <Margin2 content={content} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007580({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="absolute bg-white box-border content-stretch flex items-start left-1/2 p-[100px] top-[1550px] translate-x-[-50%] w-[1440px]">
      <Frame41 content={content} />
      <Frame1000007590 content={content} />
    </div>
  );
}

// Pricing Section Components
function Heading5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#151515] text-[48px] text-nowrap">
        <p className="leading-[60px] whitespace-pre">Pricing</p>
      </div>
    </div>
  );
}

function Margin3({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="box-border content-stretch flex flex-col items-start pb-0 pt-[5px] px-0 relative shrink-0 w-full" data-name="Margin">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">Here's what this program costs:</p>
      </div>
    </div>
  );
}

function Frame42({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[550px]">
      <Heading5 />
      <Margin3 content={content} />
    </div>
  );
}

// Icon Components
function Group() {
  return (
    <div className="[grid-area:1_/_1] ml-0 mt-0 relative size-[32px]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Group">
          <path d={svgPaths.pf661d80} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p23785400} fill="var(--fill-0, black)" id="Vector_2" />
          <path d={svgPaths.p3f3fe880} fill="var(--fill-0, black)" id="Vector_3" />
          <path d={svgPaths.p3e9b6600} fill="var(--fill-0, black)" id="Vector_4" />
          <path d={svgPaths.p1840f980} fill="var(--fill-0, black)" id="Vector_5" />
          <path d={svgPaths.p1571b100} fill="var(--fill-0, black)" id="Vector_6" />
          <path d={svgPaths.p29815bf0} fill="var(--fill-0, black)" id="Vector_7" />
          <path d={svgPaths.p3045e600} fill="var(--fill-0, black)" id="Vector_8" />
          <path d={svgPaths.p2c749b80} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p24890900} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p225aca40} fill="var(--fill-0, black)" id="Vector_11" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Group">
      <Group />
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <Group1 />
    </div>
  );
}

function Calendar2() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[24px] relative rounded-[100px] shrink-0" data-name="calendar (2)">
      <Group2 />
    </div>
  );
}

function Frame1000007581({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-bl-[32px] rounded-tl-[32px] shrink-0">
      <div className="flex flex-col justify-center overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-start justify-center p-[24px] relative w-full">
          <Calendar2 />
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#757575] text-[16px]" style={{ width: "min-content" }}>
            <div className="space-y-4">
              <div className="text-[32px] font-['Ubuntu:Medium',_sans-serif] text-[#151515]">
                {content.pricing.currency} {content.pricing.amount}
              </div>
              <p className="leading-[24px]">{content.pricing.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none rounded-bl-[32px] rounded-tl-[32px]" />
    </div>
  );
}

function Outline() {
  return (
    <div className="absolute inset-[4.17%_4.17%_4.16%_4.17%]" data-name="outline">
      <div className="absolute inset-[-0.68%_-0.69%_-0.69%_-0.69%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <g id="outline">
            <path d={svgPaths.pc287340} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p184334a0} fill="var(--fill-0, black)" id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p35d60100} fill="var(--fill-0, black)" id="Vector_3" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p38352580} fill="var(--fill-0, black)" id="Vector_4" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.pa6fa000} fill="var(--fill-0, black)" id="Vector_5" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p3f0aeec0} fill="var(--fill-0, black)" id="Vector_6" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p1a191880} fill="var(--fill-0, black)" id="Vector_7" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p30024800} fill="var(--fill-0, black)" id="Vector_8" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p1d913a80} fill="var(--fill-0, black)" id="Vector_9" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p1e0c7a70} fill="var(--fill-0, black)" id="Vector_10" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
            <path d={svgPaths.p5034f00} fill="var(--fill-0, black)" id="Vector_11" stroke="var(--stroke-0, black)" strokeWidth="0.40458" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LogicalThinking() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="logical-thinking">
      <Outline />
    </div>
  );
}

function Calendar3() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[10.959px] items-center justify-center overflow-clip p-[26.301px] relative rounded-[109.589px] shrink-0 size-[80px]" data-name="calendar (2)">
      <LogicalThinking />
    </div>
  );
}

function Frame1000007582({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="basis-0 bg-white grow h-full min-h-px min-w-px relative shrink-0">
      <div className="flex flex-col justify-center overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-start justify-center p-[24px] relative size-full">
          <Calendar3 />
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[24px] min-w-full not-italic relative shrink-0 text-[#757575] text-[16px]" style={{ width: "min-content" }}>
            <p className="mb-0">{content.programDetails.duration}. As much as we would have liked to make it self-paced, we would suggest you give some time to the activities daily. Consistency is the key here.</p>
            <p>&nbsp;</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1px_0px_1px_1px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[4%_14.49%_3.98%_14.49%]" data-name="Group">
      <div className="absolute inset-[-0.68%_-0.88%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 31">
          <g id="Group">
            <path d={svgPaths.p253c1b00} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[77.73%_51.68%_3.98%_41.48%]" data-name="Group">
      <div className="absolute inset-[-3.42%_-9.14%_-3.42%_-9.11%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 8">
          <g id="Group">
            <path d={svgPaths.p453ad80} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[4%_14.49%_3.98%_14.49%]" data-name="Group">
      <Group3 />
      <Group4 />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute inset-[9.53%_20.54%_52.79%_24.33%]" data-name="Group">
      <div className="absolute bottom-0 left-0 right-0 top-[-0.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 13">
          <g id="Group">
            <path d={svgPaths.p2bfac00} fill="var(--fill-0, black)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group62() {
  return (
    <div className="absolute contents inset-[4%_14.49%_3.98%_14.49%]">
      <Group5 />
      <Group6 />
    </div>
  );
}

function MentalDisorder1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[32px]" data-name="mental-disorder (1)">
      <Group62 />
    </div>
  );
}

function Calendar4() {
  return (
    <div className="bg-neutral-100 box-border content-stretch flex gap-[10.959px] items-center justify-center overflow-clip p-[26.301px] relative rounded-[109.589px] shrink-0 size-[80px]" data-name="calendar (2)">
      <MentalDisorder1 />
    </div>
  );
}

function Frame1000007583({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="basis-0 bg-white grow h-full min-h-px min-w-px relative rounded-br-[32px] rounded-tr-[32px] shrink-0">
      <div className="overflow-clip size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-start p-[24px] relative size-full">
          <Calendar4 />
          <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#757575] text-[16px]" style={{ width: "min-content" }}>
            <p className="leading-[24px]">In case you do feel overwhelmed with your distresses, we would strongly suggest you speak with a mental health professional.</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d9d9d9] border-solid inset-0 pointer-events-none rounded-br-[32px] rounded-tr-[32px]" />
    </div>
  );
}

function Frame1000007584({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame1000007581 content={content} />
      <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
        <Frame1000007582 content={content} />
      </div>
      <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
        <Frame1000007583 content={content} />
      </div>
    </div>
  );
}

function Frame1000007585({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="absolute bg-[#f7f7f7] box-border content-stretch flex flex-col gap-[32px] items-start left-1/2 p-[100px] top-[2400px] translate-x-[-50%] w-[1440px]">
      <Frame42 content={content} />
      <Frame1000007584 content={content} />
    </div>
  );
}

// Final CTA Section Components
function Frame1000007588({ content }: { content: EquipProgramDetails }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[48px] text-black w-full">
        <p className="leading-[60px]">Onboarding Request</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center relative shrink-0 text-[#757575] text-[16px] w-full">
        <p className="leading-[24px]">Before we begin, we would like to know something about you. We promise to keep all your data safe and will ensure your privacy.</p>
      </div>
    </div>
  );
}

function Buttons1({ onStartProgram }: { onStartProgram?: () => void }) {
  return (
    <div 
      className="bg-[#2e2a2f] box-border content-stretch flex gap-[8px] items-center px-[20px] py-[10px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#3a3a3f] transition-colors" 
      data-name="Buttons"
      onClick={onStartProgram}
    >
      <div className="flex flex-col font-['Ubuntu:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-nowrap text-white">
        <p className="leading-[28px] whitespace-pre">Start Program</p>
      </div>
    </div>
  );
}

function Frame1000007586({ content, onStartProgram }: { content: EquipProgramDetails; onStartProgram?: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-[550px]">
      <Frame1000007588 content={content} />
      <Buttons1 onStartProgram={onStartProgram} />
    </div>
  );
}

function Frame1000007589({ content, onStartProgram }: { content: EquipProgramDetails; onStartProgram?: () => void }) {
  return (
    <div className="h-[450px] relative rounded-[40px] shrink-0 w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[40px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgFrame1000007589} />
      </div>
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] h-[450px] items-start justify-center p-[50px] relative w-full">
          <Frame1000007586 content={content} onStartProgram={onStartProgram} />
        </div>
      </div>
    </div>
  );
}

function Frame1000007587({ content, onStartProgram }: { content: EquipProgramDetails; onStartProgram?: () => void }) {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col gap-[10px] items-start justify-center left-1/2 p-[100px] top-[2991px] translate-x-[-50%] w-[1440px]">
      <Frame1000007589 content={content} onStartProgram={onStartProgram} />
    </div>
  );
}

export function EquipProgramLandingFigma({ onStartProgram, onBack }: EquipProgramLandingFigmaProps) {
  const isMobile = useIsMobile();
  const [content, setContent] = useState<EquipProgramDetails | null>(null);
  
  // Load program content based on stored program
  useEffect(() => {
    const storedProgram = getStoredProgram();
    if (storedProgram && storedProgram.slug) {
      const programContent = getEquipProgramContent(storedProgram.slug);
      setContent(programContent || getDefaultEquipProgramContent());
    } else {
      // Default to general program content if no specific program selected
      setContent(getDefaultEquipProgramContent());
    }
  }, []);

  const handleStartProgram = () => {
    const storedProgram = getStoredProgram();
    const programId = storedProgram?.id || storedProgram?.slug || content?.id || 'default';
    
    if (onStartProgram) {
      onStartProgram(programId);
    }
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
    <div className="bg-neutral-100 relative size-full" data-name="05_Equips_LP">
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
      
      {/* Hero Section */}
      <Frame1000007576 content={content} onStartProgram={handleStartProgram} />
      
      {/* About Section */}
      <Frame1000007578 content={content} />
      
      {/* Two Column Section */}
      <Frame1000007580 content={content} />
      
      {/* Things to Note Section */}
      <Frame1000007585 content={content} />
      
      {/* Final CTA Section */}
      <Frame1000007587 content={content} onStartProgram={handleStartProgram} />
      
      {/* Footer */}
      <div className="absolute bg-[#3d3d3d] bottom-0 h-[62px] left-1/2 translate-x-[-50%] w-[1440px]" />
    </div>
  );
}