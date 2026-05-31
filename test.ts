#!/usr/bin/env -S deno run --allow-all

/**
 * Test script for PDF Banner Generator
 * 
 * This script runs various test cases to validate the banner generation
 * functionality and helps ensure the application works correctly across
 * different configurations.
 * 
 * Usage: deno run --allow-all test.ts
 */

import { Command } from "@cliffy/command";

interface TestCase {
  name: string;
  args: string[];
  expectedOutput: string;
  description: string;
}

const testCases: TestCase[] = [
  {
    name: "basic-banner",
    args: ["--text", "TEST BANNER", "--output", "test_basic.pdf"],
    expectedOutput: "test_basic.pdf",
    description: "Basic banner with default settings"
  },
  {
    name: "large-banner",
    args: [
      "--text", "LARGE BANNER TEST", 
      "--width", "3000", 
      "--height", "1200", 
      "--font-size", "40",
      "--output", "test_large.pdf"
    ],
    expectedOutput: "test_large.pdf",
    description: "Large banner with intermediate circles"
  },
  {
    name: "multiline-text",
    args: [
      "--text", "MULTI\\nLINE\\nTEST", 
      "--font-size", "30",
      "--fg", "red",
      "--bg", "white",
      "--output", "test_multiline.pdf"
    ],
    expectedOutput: "test_multiline.pdf",
    description: "Multi-line text with custom colors"
  },
  {
    name: "small-font",
    args: [
      "--text", "Small Font Test", 
      "--font-size", "8",
      "--output", "test_small_font.pdf"
    ],
    expectedOutput: "test_small_font.pdf",
    description: "Small font size test (8mm)"
  },
  {
    name: "color-palette",
    args: [
      "--text", "COLOR TEST", 
      "--fg", "navy",
      "--bg", "gold",
      "--output", "test_colors.pdf"
    ],
    expectedOutput: "test_colors.pdf",
    description: "Extended color palette test"
  }
];

async function runTest(testCase: TestCase): Promise<boolean> {
  console.log(`\n🧪 Running test: ${testCase.name}`);
  console.log(`   ${testCase.description}`);
  
  try {
    // Run the generation
    console.log(`   Command: deno run --allow-all main.ts ${testCase.args.join(' ')}`);
    
    // For now, we'll simulate running the command since we can't directly call generatePDF
    // In a real test, you would call generatePDF directly
    const process = new Deno.Command("deno", {
      args: ["run", "--allow-all", "main.ts", ...testCase.args],
      cwd: Deno.cwd(),
    });
    
    const { code, stderr } = await process.output();
    
    if (code === 0) {
      // Check if output file exists
      try {
        const stat = await Deno.stat(testCase.expectedOutput);
        if (stat.isFile) {
          console.log(`   ✅ Success: ${testCase.expectedOutput} created`);
          // Clean up test file
          await Deno.remove(testCase.expectedOutput);
          return true;
        }
      } catch {
        console.log(`   ❌ Failed: Output file ${testCase.expectedOutput} not created`);
        return false;
      }
    } else {
      const errorOutput = new TextDecoder().decode(stderr);
      console.log(`   ❌ Failed: Process exited with code ${code}`);
      console.log(`   Error: ${errorOutput}`);
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   ❌ Failed: ${message}`);
    return false;
  }
  
  return false;
}

async function runAllTests(): Promise<void> {
  console.log("🚀 Starting PDF Banner Generator Tests");
  console.log("=====================================");
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log("\n📊 Test Results");
  console.log("===============");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please check the output above.`);
  }
}

// Command line interface for the test script
if (import.meta.main) {
  await new Command()
    .name("test")
    .version("1.0.0")
    .description("Test script for PDF Banner Generator")
    .action(async () => {
      await runAllTests();
    })
    .parse(Deno.args);
}
