#!/bin/bash

# Helper script for n8n setup - DoubtMap Hackathon
# Run this to get quick info about your n8n workflows

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         DoubtMap n8n Setup Helper                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -d "n8n/workflows" ]; then
    echo "❌ Error: Run this from /home/prashant/Desktop/hack/DoubtMap/"
    exit 1
fi

echo "📁 Found $(ls n8n/workflows/*.json | wc -l) workflow files:"
echo ""
ls -1 n8n/workflows/*.json | while read file; do
    filename=$(basename "$file")
    size=$(du -h "$file" | cut -f1)
    echo "  ✓ $filename ($size)"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Quick Check: Workflow 1 Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show nodes in Workflow 1
if [ -f "n8n/workflows/workflow1-weekly-report.json" ]; then
    echo "Workflow 1 has these nodes:"
    jq -r '.nodes[] | "  • \(.name) (\(.type | split(".")[2]))"' n8n/workflows/workflow1-weekly-report.json 2>/dev/null || echo "  (Install jq to see details: sudo apt install jq)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Your Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1️⃣  Read the beginner guide:"
echo "      cat n8n/docs/beginner-setup-guide.md | less"
echo ""
echo "  2️⃣  View your team sharing file:"
echo "      cat n8n-team-share.txt"
echo ""
echo "  3️⃣  Import workflows to n8n Cloud:"
echo "      - Go to your n8n Cloud URL"
echo "      - Workflows → Import"
echo "      - Select files from: n8n/workflows/"
echo ""
echo "  4️⃣  Get webhook URLs from workflows 3 & 5"
echo ""
echo "  5️⃣  Share info with team (n8n-team-share.txt)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🆘 Need help? Read: n8n/docs/beginner-setup-guide.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
