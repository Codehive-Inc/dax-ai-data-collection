# AI Model Fine-Tuning Curation App

A React-based web application for curating and refining AI-generated DAX formulas for BI migration projects. This tool enables BI developers to interactively correct AI model outputs and export high-quality training datasets for fine-tuning.

## Features

- **Multi-Model Support**: Three distinct migration paths:
  - Cognos to Power BI (`/cognos-to-pbi`)
  - MicroStrategy to Power BI (`/microstrategy-to-pbi`) 
  - Tableau to Power BI (`/tableau-to-pbi`)

- **Two-Pane Interface**:
  - Left pane: List of migration examples with source expressions, initial DAX formulas, and corrected versions
  - Right pane: Conversational AI chat interface for iterative refinement

- **Interactive Curation**:
  - Chat with AI to refine DAX formulas
  - Copy code blocks with one click
  - "Use as Corrected DAX" button to update examples
  - Visual feedback for corrected examples

- **Export Functionality**:
  - Generate JSONL files ready for OpenAI fine-tuning
  - Automatic filtering of refined examples
  - Timestamped file naming

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dax-ai-data-collection
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Backend API (Optional)

The app includes a fallback mock API for development. To use a real backend:

1. Set up your backend API endpoint at `/api/v1/chat`
2. Configure the API base URL in your environment:
   ```bash
   REACT_APP_API_BASE_URL=http://your-backend-url
   ```

The expected API contract:

**POST /api/v1/chat**
```json
{
  "model_type": "cognos | microstrategy | tableau",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

Response:
```json
{
  "reply": {
    "role": "assistant", 
    "content": "AI response with DAX code blocks"
  }
}
```

## Usage

### Loading Examples

The app loads migration examples from JSONL files in the `public/data/` directory:
- `cognos-examples.jsonl`
- `microstrategy-examples.jsonl` 
- `tableau-examples.jsonl`

Each JSONL file contains one JSON object per line in OpenAI fine-tuning format:
```json
{"messages": [{"role": "system", "content": "You are an expert..."}, {"role": "user", "content": "Convert this expression: [expression]"}, {"role": "assistant", "content": "The equivalent DAX formula is:\n\n[DAX code]"}]}
```

The app automatically extracts:
- **Source Expression**: From the user message content
- **Initial DAX Formula**: From the assistant message content (cleaned)
- **Corrected DAX Formula**: Empty initially, filled by user corrections

**Fallback Support**: The app also supports the legacy JSON format for backward compatibility.

### Curation Workflow

1. **Select a Migration Path**: Navigate to one of the three routes
2. **Choose an Example**: Click on an example in the left pane
3. **Chat with AI**: Use the chat interface to refine the DAX formula
4. **Apply Corrections**: Click "Use as Corrected DAX" on improved formulas
5. **Export Dataset**: Click "Prepare Final Dataset" to download the JSONL file

### Exporting Training Data

The export function:
- Filters examples with corrected DAX formulas
- Excludes examples where corrected formula equals initial formula
- Formats data as JSONL for OpenAI fine-tuning
- Includes appropriate system prompts for each model type

## Project Structure

```
src/
├── components/
│   ├── CurationApp.js      # Main application component
│   ├── ExamplesList.js     # Left pane - examples list
│   ├── ChatInterface.js    # Right pane - chat interface
│   └── Toast.js           # Toast notifications
├── utils/
│   ├── dataUtils.js       # Data loading and export functions
│   └── apiUtils.js        # API communication utilities
├── App.js                 # Router setup
├── index.js              # Application entry point
└── index.css             # Global styles

public/
└── data/                 # Example data files
    ├── cognos-examples.json
    ├── microstrategy-examples.json
    └── tableau-examples.json
```

## Customization

### Adding New Migration Paths

1. Add a new route in `App.js`
2. Create corresponding example data file in `public/data/`
3. Update the `modelTypeLabels` and `systemPrompts` in the respective components

### Styling

The app uses CSS classes for styling. Key classes:
- `.example-item` - Individual example cards
- `.message` - Chat messages
- `.code-block` - Code block containers
- `.btn` - Button styles

### DAX Detection

The chat interface automatically detects DAX formulas using keywords and patterns. Modify the `isDaxFormula` logic in `ChatInterface.js` to adjust detection sensitivity.

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

- `REACT_APP_API_BASE_URL` - Backend API base URL (defaults to localhost:3001)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
