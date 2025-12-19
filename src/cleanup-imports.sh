#!/bin/bash

# Script to identify and list unused files in /imports/

echo "=== ACTIVELY USED IMPORTS ==="
echo ""

# SVGs actively imported from components/
echo "SVGs from components:"
echo "  svg-qo9pds304d.ts (AboutUs)"
echo "  svg-3566o.tsx (AboutUs desktop)"
echo "  svg-rbsc8v77kz.ts (AboutUs mobile)"
echo "  svg-k6678.tsx (AboutUs mobile)"
echo "  svg-ta5wpcle0i.ts (EquipPrograms)"
echo "  svg-1uue509bxb.ts (EquipPrograms)"
echo "  svg-rdg85uq8eg.ts (FAQSection, EquipBlock)"
echo "  svg-ul0k820b9n.ts (Footer)"
echo "  svg-850apu7kjy.ts (LoginScreen)"
echo "  svg-ptmlmkxncr.ts (Logo, PWAIconGenerator)"
echo "  svg-epzl744ze1.ts (Logo)"
echo "  svg-ajk3bd3zji.ts (BottomNavBarMobile)"
echo ""

# SVGs from imports/ components that are still used
echo "SVGs from imports/ components:"
echo "  svg-9uz5q7h5jm.ts (ConsultantCard - KEEP)"
echo ""

# Components actively used
echo "Components actively imported:"
echo "  ConsultantCard.tsx (AssessmentResults)"
echo ""

echo "=== FILES TO KEEP (16 total) ==="
echo ""
echo "SVG Files (13):"
echo "  svg-qo9pds304d.ts"
echo "  svg-3566o.tsx"
echo "  svg-rbsc8v77kz.ts"
echo "  svg-k6678.tsx"
echo "  svg-ta5wpcle0i.ts"
echo "  svg-1uue509bxb.ts"
echo "  svg-rdg85uq8eg.ts"
echo "  svg-ul0k820b9n.ts"
echo "  svg-850apu7kjy.ts"
echo "  svg-ptmlmkxncr.ts"
echo "  svg-epzl744ze1.ts"
echo "  svg-ajk3bd3zji.ts"
echo "  svg-9uz5q7h5jm.ts"
echo ""
echo "Component Files (1):"
echo "  ConsultantCard.tsx"
echo ""

echo "=== UNUSED COMPONENTS TO DELETE ==="
echo ""
echo "Frame Components (10):"
ls /imports/Frame*.tsx 2>/dev/null
echo ""

echo "Other Components (19):"
cd /imports
for file in *.tsx; do
  case "$file" in
    "ConsultantCard.tsx"|"Frame"*|"svg-"*)
      # Skip these
      ;;
    *)
      echo "  $file"
      ;;
  esac
done
echo ""

echo "=== UNUSED SVG FILES ==="
echo ""
echo "Total SVG files: ~120"
echo "Used SVG files: 13"
echo "To delete: ~107 SVG files"
echo ""

echo "Run manual deletion or use cleanup script"
