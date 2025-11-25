from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Configure Google Gemini
api_key = os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
else:
    print("⚠️  WARNING: GOOGLE_API_KEY not found!")
    model = None

# Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API is running and key is configured"""
    api_key_configured = bool(api_key)
    return jsonify({
        'status': 'healthy',
        'api_key_configured': api_key_configured,
        'message': 'API is running' if api_key_configured else 'API key not configured'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint for AI conversations"""
    try:
        if not model:
            return jsonify({
                'success': False,
                'error': 'API key not configured. Please set GOOGLE_API_KEY environment variable.'
            }), 500
        
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'No message provided'
            }), 400
        
        # Build conversation context
        conversation_context = ""
        if history and len(history) > 1:
            # Include last few messages for context
            recent_history = history[-6:]  # Last 3 exchanges
            for msg in recent_history:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    conversation_context += f"User: {content}\n"
                elif role == 'assistant':
                    conversation_context += f"Assistant: {content}\n"
        
        # Create the prompt
        system_prompt = """You are an AI Business Analyzer assistant specializing in helping entrepreneurs and business professionals. Your capabilities include:

1. **Business Idea Generation**: Create unique, innovative business concepts with detailed analysis
2. **Market Analysis**: Provide comprehensive market research, competitor insights, and industry trends
3. **Financial Projections**: Develop realistic financial models, revenue forecasts, and cost structures
4. **Marketing Strategies**: Design effective marketing plans, customer acquisition strategies, and growth tactics
5. **Business Data Analysis**: Interpret business metrics, identify trends, and provide actionable recommendations

Guidelines:
- Be specific and actionable in your advice
- Provide concrete examples and real-world insights
- Consider current market trends and economic conditions
- Tailor responses to the user's context
- Vary your responses - avoid repetitive patterns
- Use data and statistics when relevant
- Be creative and think outside the box

Current conversation context:
{context}

User's new question: {question}

Provide a detailed, helpful response:"""
        
        full_prompt = system_prompt.format(
            context=conversation_context if conversation_context else "No previous context",
            question=message
        )
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        if response and response.text:
            return jsonify({
                'success': True,
                'response': response.text,
                'model': 'gemini-pro'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'No response generated'
            }), 500
        
    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error generating response: {str(e)}'
        }), 500

@app.route('/api/analyze-file', methods=['POST'])
def analyze_file():
    """Analyze uploaded business data files"""
    try:
        if not model:
            return jsonify({
                'success': False,
                'error': 'API key not configured'
            }), 500
        
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Empty filename'
            }), 400
        
        # Read file content
        content = file.read().decode('utf-8', errors='ignore')
        
        # Create analysis prompt
        analysis_prompt = f"""Analyze this business data file and provide comprehensive insights:

Filename: {file.filename}
File Content:
{content}

Please provide a detailed analysis including:

1. **Key Metrics Summary**
   - Identify the main performance indicators
   - Highlight significant numbers and trends

2. **Trend Analysis**
   - Revenue patterns and growth trends
   - Expense analysis and cost structure
   - Profit margins and profitability

3. **Performance Insights**
   - Strong performing areas
   - Areas needing improvement
   - Seasonal patterns or anomalies

4. **Actionable Recommendations**
   - Specific steps to improve performance
   - Cost optimization opportunities
   - Revenue growth strategies

5. **Risk Assessment**
   - Potential concerns or red flags
   - Areas requiring attention

6. **Next Steps**
   - Immediate actions to take
   - Long-term strategic recommendations

Be specific with numbers from the data and provide concrete, actionable advice."""
        
        # Generate analysis
        response = model.generate_content(analysis_prompt)
        
        # Check if data contains numbers for chart generation
        has_numeric_data = any(char.isdigit() for char in content)
        
        if response and response.text:
            return jsonify({
                'success': True,
                'analysis': response.text,
                'has_charts': has_numeric_data,
                'filename': file.filename
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to analyze file'
            }), 500
        
    except Exception as e:
        print(f"❌ Error in analyze-file endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error analyzing file: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 AI Business Analyzer API")
    print("="*70)
    
    if not api_key:
        print("❌ ERROR: GOOGLE_API_KEY environment variable not set!")
        print("📝 Please set it with: export GOOGLE_API_KEY=your_key_here")
        print("🔗 Get your key at: https://aistudio.google.com/app/apikey")
    else:
        print("✅ API Key: Configured")
        print("🤖 Model: Google Gemini Pro")
        print("🌐 Server: Running on http://localhost:5000")
    
    print("="*70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
