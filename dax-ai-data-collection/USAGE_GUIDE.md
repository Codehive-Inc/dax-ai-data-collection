# Usage Guide: AI Model Fine-Tuning Curation App

## Quick Start

1. **Start the application**:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000` and redirect to `/cognos-to-pbi`

2. **Navigate between migration paths**:
   - Cognos to Power BI: `http://localhost:3000/cognos-to-pbi`
   - MicroStrategy to Power BI: `http://localhost:3000/microstrategy-to-pbi`
   - Tableau to Power BI: `http://localhost:3000/tableau-to-pbi`

## Step-by-Step Workflow

### 1. Select Migration Path
Choose your source system by navigating to the appropriate URL. The header will show which migration path you're currently working on.

### 2. Review Examples
The left pane shows all available migration examples with:
- **Source Expression**: Original formula from your BI tool
- **Initial DAX Formula**: AI's first conversion attempt
- **Corrected DAX Formula**: Your refined version (initially empty)

### 3. Start Curation Process
1. Click on any example in the left pane
2. The chat interface will initialize with the source expression
3. The AI will show its initial DAX conversion

### 4. Refine the DAX Formula
Use natural language to guide the AI:

**Example conversations**:
```
You: "Please use VAR to make this more readable"
AI: [Provides DAX with VAR statements]

You: "Can you optimize this for better performance?"
AI: [Suggests performance improvements]

You: "Add error handling for division by zero"
AI: [Includes DIVIDE function or error checks]
```

### 5. Apply Corrections
When the AI provides a satisfactory DAX formula:
1. Look for code blocks in the chat (highlighted with gray background)
2. Click **"Use as Corrected DAX"** button on the desired formula
3. The left pane will update to show your correction (green background)

### 6. Export Training Dataset
After refining multiple examples:
1. Click **"Prepare Final Dataset"** at the bottom of the left pane
2. The app will generate a JSONL file with only refined examples
3. File downloads automatically with timestamp in filename

## Tips for Effective Curation

### Best Practices
- **Be Specific**: Instead of "fix this", say "use CALCULATE to modify filter context"
- **Iterate Gradually**: Make one improvement at a time
- **Test Different Approaches**: Try multiple refinements for complex formulas
- **Use DAX Best Practices**: Ask for VAR statements, proper function usage, etc.

### Common Refinement Requests
```
"Use VAR to store intermediate calculations"
"Add error handling with DIVIDE instead of /"
"Optimize for better performance"
"Make this more readable"
"Add comments to explain the logic"
"Use CALCULATE to modify filter context"
"Replace nested IF with SWITCH"
```

### Quality Indicators
Look for these improvements in refined DAX:
- ✅ Proper use of VAR statements
- ✅ Error handling (DIVIDE, IFERROR)
- ✅ Appropriate filter context modifications
- ✅ Performance optimizations
- ✅ Clear, readable structure

## Understanding the Export

### JSONL Format
The exported file contains training examples in OpenAI's fine-tuning format:
```json
{"messages": [
  {"role": "system", "content": "You are an expert in converting Cognos expressions to Power BI DAX formulas..."},
  {"role": "user", "content": "[Sales].[Revenue] / [Sales].[Units]"},
  {"role": "assistant", "content": "VAR TotalRevenue = SUM([Revenue])\nVAR TotalUnits = SUM([Units])\nRETURN\n    DIVIDE(TotalRevenue, TotalUnits)"}
]}
```

### What Gets Exported
- Only examples with corrected DAX formulas
- Excludes examples where correction equals initial formula
- Includes appropriate system prompts for each migration path
- Formatted for immediate use in OpenAI fine-tuning

## Troubleshooting

### Common Issues

**No examples loading**:
- Check that data files exist in `public/data/`
- Verify JSON syntax in example files
- Check browser console for errors

**Chat not working**:
- App uses mock responses by default
- For real AI integration, implement the backend API
- Check network tab for API call failures

**Export not working**:
- Ensure you have corrected at least one example
- Check that corrections are different from initial formulas
- Verify browser allows file downloads

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE: Not supported

## Customization

### Adding Your Own Examples

**Option 1: JSONL Format (Recommended)**
1. Edit JSONL files in `public/data/`:
   - `cognos-examples.jsonl`
   - `microstrategy-examples.jsonl`
   - `tableau-examples.jsonl`

2. Add one JSON object per line:
```json
{"messages": [{"role": "system", "content": "You are an expert in converting [Source] expressions to Power BI DAX expressions."}, {"role": "user", "content": "Convert this [Source] expression to DAX: [your expression]"}, {"role": "assistant", "content": "The equivalent DAX formula is:\n\n[DAX formula]"}]}
```

**Option 2: Legacy JSON Format**
1. Create JSON files with `.json` extension
2. Follow this structure:
```json
[
  {
    "id": "unique-id",
    "sourceExpression": "Original formula",
    "initialDaxFormula": "AI's first attempt"
  }
]
```

### Integrating Real AI Backend
1. Implement the API endpoint at `/api/v1/chat`
2. Follow the contract in `backend-example.js`
3. Set `REACT_APP_API_BASE_URL` environment variable
4. Replace mock responses with your AI model

### Styling Customization
Key CSS classes to modify:
- `.example-item` - Example cards appearance
- `.message` - Chat message styling
- `.code-block` - Code block formatting
- `.btn` - Button styles

## Performance Tips

### For Large Datasets
- Load examples in batches if you have 100+ examples
- Consider pagination for the examples list
- Implement virtual scrolling for very large lists

### For Production Use
- Implement proper error boundaries
- Add loading states for all async operations
- Consider caching refined examples locally
- Add undo/redo functionality for corrections

## Next Steps

After using this tool to curate your dataset:

1. **Fine-tune your model** using the exported JSONL file
2. **Evaluate improvements** by testing on held-out examples  
3. **Iterate** by curating more examples based on model performance
4. **Deploy** your improved model to production systems

For questions or issues, refer to the main README.md file.
