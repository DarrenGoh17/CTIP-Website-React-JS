import asyncio
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import json
import os

# Initialize the SentenceTransformer model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Define file paths
faiss_index_path_new = "C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (user)\\web_index_faiis.bin"
ids_file_new = "C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (user)\\faiss_ids_web.npy"
descriptions_file_new = "C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (user)\\descriptions_web.npy"
embeddings_file_new = "website_embeddings_new.txt"  # Text file for website data
json_file_path = "C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (user)\\en.json"  # Path to the en.json file

# Initialize FAISS index with the correct dimensionality (384 for this model)
index = faiss.IndexFlatL2(384)  # 384 dimensions for the 'all-MiniLM-L6-v2' model

faiss_ids = []
descriptions = []

def save_embedding_to_file(index, description, embedding, file_path=embeddings_file_new):
    """Save the index, description, and its embedding to a text file."""
    with open(file_path, "a") as f:
        f.write(f"Index: {index}\n")  # Save the index
        f.write(f"Description: {description}\n")  # Save the description
        f.write(f"Embedding: {embedding.tolist()}\n\n")  # Convert numpy array to list for readability

def embed_and_add_to_faiss(content):
    """Embed the content and add it to the FAISS index."""
    new_embedding = model.encode([content]).astype("float32")
    new_id = len(faiss_ids)  # Generate a unique ID
    index.add(new_embedding)  # Add embedding to FAISS index
    faiss_ids.append(new_id)
    descriptions.append(content)  # Store a shortened description
    
    # Save embedding and description to text file, including the index
    save_embedding_to_file(new_id, content, new_embedding)

def save_section_to_faiss(section_name, section_data):
    """Process a section and add it to the FAISS index."""
    # Concatenate the fields of the section into a string
    content = f"Section: {section_name} | Content: {json.dumps(section_data)}"
    
    # Generate embedding and add to FAISS index
    new_embedding = model.encode([content]).astype("float32")
    new_id = len(faiss_ids)  # Generate a unique ID
    index.add(new_embedding)  # Add embedding to FAISS index
    faiss_ids.append(new_id)
    descriptions.append(content)  # Store a shortened description

    # Save embedding and description to text file
    save_embedding_to_file(new_id, content, new_embedding)

def process_json_sections(json_data):
    """Process specific sections in the JSON and add them to the FAISS index."""
    # Define the sections you want to index (like 'home', 'header', etc.)
    sections_to_index = [
        "home", "header", "things_to_do", "whats_happening", 
        "wildlife_animals", "donation_box", "donation", 
        "feedingSession", "natureWalk", "photoSession", "rehabilitation", 
        "quiz", "conservation", "map", "more", "faq", "appSettings", "footer"
    ]
    
    # Loop over the sections and process them
    for section in sections_to_index:
        if section in json_data:
            save_section_to_faiss(section, json_data[section])

# Load the JSON file
with open(json_file_path, 'r', encoding='utf-8') as file:
    json_data = json.load(file)

# Process the JSON sections and add them to FAISS
process_json_sections(json_data)

# Save the updated FAISS index and metadata files
faiss.write_index(index, faiss_index_path_new)
np.save(ids_file_new, faiss_ids)
np.save(descriptions_file_new, descriptions)

print(f"New FAISS index, IDs, and descriptions have been saved to {faiss_index_path_new}, {ids_file_new}, and {descriptions_file_new} respectively.")

# Save all embeddings and descriptions to a new text file
with open(embeddings_file_new, "a") as f:
    f.write("Embeddings and Descriptions for JSON Data - Process Completed\n")
print(f"All embeddings and descriptions have been saved to {embeddings_file_new}.")


# Load the JSON file
with open(json_file_path, 'r', encoding='utf-8') as file:
    json_data = json.load(file)

# Process the JSON content and add embeddings to FAISS
process_json_sections(json_data)

# Save the updated FAISS index and metadata files
faiss.write_index(index, faiss_index_path_new)
np.save(ids_file_new, faiss_ids)
np.save(descriptions_file_new, descriptions)

print(f"New FAISS index, IDs, and descriptions have been saved to {faiss_index_path_new}, {ids_file_new}, and {descriptions_file_new} respectively.")

# Save all embeddings and descriptions to a new text file
with open(embeddings_file_new, "a") as f:
    f.write("Embeddings and Descriptions for JSON Data - Process Completed\n")
print(f"All embeddings and descriptions have been saved to {embeddings_file_new}.")
