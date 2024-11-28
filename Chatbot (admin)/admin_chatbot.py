from flask import Flask, render_template, request, session
import os
import google.generativeai as genai
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)

app.secret_key = 'cos30049' 

# Set environment variables
os.environ['GOOGLE_API_KEY'] = 'AIzaSyBUXU28xMS8L00QioB7NlNG4KX2gkmD3aI'
google_api_key = os.getenv('GOOGLE_API_KEY')

# Ensure token is available
if not google_api_key:
    raise ValueError("Please set the GOOGLE_API_KEY environment variable")

# Configure Google GenerativeAI model
genai.configure(api_key=google_api_key)
google_model = genai.GenerativeModel('gemini-1.0-pro')

# Initialize SentenceTransformer model for embedding
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Load the FAISS index and metadata from disk
def load_index_and_metadata():
    index = faiss.read_index("C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (admin)\\semenggoh_faiss_index.bin")
    faiss_ids = np.load("C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (admin)\\faiss_ids.npy", allow_pickle=True)
    descriptions = np.load("C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (admin)\\descriptions.npy", allow_pickle=True)
    print("FAISS index and metadata loaded successfully.")
    return index, faiss_ids, descriptions

def search_faiss(query, index, faiss_ids, descriptions, k=10):
    query_embedding = model.encode([query]).astype("float32")
    distances, indices = index.search(query_embedding, k)

    # Retrieve and structure the results
    results = []
    for i, idx in enumerate(indices[0]):
        if idx != -1:  # Check if index is valid
            result_info = {
                "description": descriptions[idx],
                "faiss_id": faiss_ids[idx]
            }
            results.append(result_info)
    
    # Print results in a structured and readable format without distance
    print("\nStructured FAISS Search Results:")
    for i, result in enumerate(results):
        print(f"Result {i + 1}:")
        print(f"  FAISS ID       : {result['faiss_id']}")
        print(f"  Description    : {result['description']}...")  # Limit description length for readability
        print("-" * 80)  # Divider for clarity

    return results

def generate_user_friendly_response(question, faiss_results):
    """Use Gemini to generate a concise and visitor-friendly response based on FAISS-based context."""
    context = (
        "You are a knowledgeable assistant for a nature reserve, providing clear, accurate, and concise answers to visitors' questions. "
        "Focus strictly on the visitor's question and extract only the relevant information from the provided context. "
        "Do not repeat the visitor's question in your response. "
        "Describe your answers using full sentences that are well-formatted, and easy to understand for a visitor to the nature reserve.\n\n"
    )
    context += f"Visitor's Question: {question}\n\n"
    context += "Information from the Nature Reserve Database:\n\n"

    for i, result in enumerate(faiss_results[:10]):  # Limit to top 10 results
        context += f"Result {i + 1}:\n"
        context += f"Description:\n{result['description']}\n"
        context += "-" * 40 + "\n"

    context += (
        "\nBased on the information provided, choose the relevant information and describe the information using sentences to generate a descriptive response that directly addresses the visitor's question. "
        "Do not include or repeat the visitor's question."
    )

    response = google_model.generate_content(context)
    return response.text if response else "I'm sorry, I couldn't find any relevant information."

@app.route('/')
def index():
    return render_template('chatbot.html')

@app.route('/submit-question', methods=['POST'])
def submit_question():
    question = request.form.get('question', '').strip()
    logging.debug(f"Received question: {question}")

    if not question:
        return {"question": question, "response": "Please enter a valid question."}

    try:
        # Load the FAISS index and metadata
        index, faiss_ids, descriptions = load_index_and_metadata()
        logging.debug("FAISS index and metadata loaded successfully.")
        
        # Search the FAISS index for similar entries
        results = search_faiss(question, index, faiss_ids, descriptions)
                
        # Generate response
        if results:
            response = generate_user_friendly_response(question, results)
        else:
            response = "Sorry, I couldn't find any relevant information."
        
    except FileNotFoundError as fnf_error:
        logging.error(f"File not found error: {fnf_error}", exc_info=True)
        response = "An error occurred while accessing required files."
    except ValueError as val_error:
        logging.error(f"Value error: {val_error}", exc_info=True)
        response = "An error occurred while processing your input."
    except Exception as e:
        logging.error(f"Unexpected error occurred: {e}", exc_info=True)
        response = "An unexpected error occurred while processing your question."

    return {"question": question, "response": response}

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=7000, debug=True)