import mysql.connector
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import time
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the embedding model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Connect to the database
def create_connection():
    """Establish a connection to the database."""
    try:
        connection = mysql.connector.connect(
            host="127.0.0.1",  # Use 127.0.0.1 instead of localhost
            user="root",
            password="",  # Replace with your actual MySQL password
            database="semenggoh"
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Connection error: {err}")
        return None

# Fetch data with a custom query
def fetch_data(query, params=None, max_retries=3):
    """Execute a query to retrieve data from the database with reconnection logic."""
    for attempt in range(max_retries):
        connection = create_connection()
        if connection is None:
            print("Retrying to connect...")
            time.sleep(2)  # Wait before retrying
            continue
        
        cursor = connection.cursor(dictionary=True)
        data = []
        try:
            cursor.execute(query, params)
            data = cursor.fetchall()
            return data
        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return []  # Return an empty list on error
        finally:
            cursor.close()
            connection.close()  # Ensure connection is closed in 'finally' block
    
    print("Failed to fetch data after multiple attempts.")
    return []

# Fetch related data by querying with a foreign key
def fetch_related_records(table_name, foreign_key_column, foreign_key_value):
    """Fetch related records based on a foreign key relationship."""
    query = f"SELECT * FROM {table_name} WHERE {foreign_key_column} = %s"
    return fetch_data(query, (foreign_key_value,))

# Fetch the total counts of sites, species, and images
def fetch_total_counts():
    """Fetch total counts of sites, species, and images."""
    counts = {}
    counts['total_sites'] = fetch_data("SELECT COUNT(*) as count FROM sites")[0]['count']
    counts['total_species'] = fetch_data("SELECT COUNT(*) as count FROM species")[0]['count']
    counts['total_images'] = fetch_data("SELECT COUNT(*) as count FROM images")[0]['count']
    return counts

# Fetch temperature trends for each site including high and low temperatures
def fetch_temperature_trends():
    """Fetch the average, highest, and lowest temperature trend for each site."""
    query = """
    SELECT site_id, 
           AVG(temperature) as average_temp, 
           MAX(temperature) as highest_temp, 
           MIN(temperature) as lowest_temp
    FROM images 
    GROUP BY site_id
    """
    return fetch_data(query)

def prepare_text(record, table_name, temperature_trends, output_file="prepared_texts.txt"):
    """Prepare a detailed descriptive text including foreign key data and trends and save it to a file."""
    if table_name == "images":
        site_info = fetch_related_records("sites", "site_id", record['site_id'])
        if site_info:  # Check if site_info is not empty
            site_info = site_info[0]
            text = (f"Image {record['image_name']} was captured on {record['capture_date']} at {record['capture_time']}. "
                    f"The temperature at the time of capture was {record['temperature']}°C at site {site_info['site_name']}. ")    
        else:
            logging.warning(f"No site information found for site_id {record['site_id']}.")
            return ""  # Return early if no site info

    elif table_name == "sites":
        images = fetch_related_records("images", "site_id", record['site_id'])
        species_count = {}
    
        for img in images:
            predictions = fetch_related_records("predictions", "image_id", img['image_id'])
            for pred in predictions:
                species = fetch_related_records("species", "species_id", pred['species_id'])
                if species:  # Check if species is not empty
                    species_name = species[0]['species_name']
    
                    # Count sightings per species
                    if species_name in species_count:
                        species_count[species_name] += 1
                    else:
                        species_count[species_name] = 1
    
        # Get the temperature trend for the current site
        temp_data = next((t for t in temperature_trends if t['site_id'] == record['site_id']), {})
        avg_temp = temp_data.get('average_temp', "No temperature data")
        highest_temp = temp_data.get('highest_temp', "No data")
        lowest_temp = temp_data.get('lowest_temp', "No data")
        
        # Prepare additional site information
        category = record.get('Category', "N/A")
        latitude = record.get('Latitude', "N/A")
        longitude = record.get('Longitude', "N/A")
        region = record.get('Region', "N/A")
        division_regency = record.get('Division/Regency', "N/A")
        coordinate_x = record.get('coordinate_x', "N/A")
        coordinate_y = record.get('coordinate_y', "N/A")
        elevation_m = record.get('elevation_m', "N/A")
        forest_cover = record.get('forestCover_%', "N/A")
        canopy_height = record.get('canopyHeight_m', "N/A")
        water_occurrence = record.get('waterOccurrence_%', "N/A")
        distance_to_road = record.get('distanceToRoad_m', "N/A")
        human_population_count = record.get('humanPopulationCount_n', "N/A")

        species_count_str = ', '.join([f"{species}: {count}" for species, count in species_count.items()]) if species_count else "No sightings recorded"
        
        # Create structured sentences
        text = (f"Site {record['site_name']} is located in {region} at coordinates ({latitude}, {longitude}). "
                f"It falls under the category '{category}' and is part of {division_regency}. "
                f"The site has coordinates X: {coordinate_x} and Y: {coordinate_y}. "
                f"The elevation is {elevation_m} meters above sea level. "
                f"The forest cover is {forest_cover}%, and the canopy height is {canopy_height} meters. "
                f"There is a water occurrence rate of {water_occurrence}%. "
                f"The distance to the nearest road is {distance_to_road} meters. "
                f"The human population count in the area is {human_population_count}. "
                f"The site hosts {len(species_count)} unique species with the following sighting counts: {species_count_str}. "
                f"The average temperature at this site is {avg_temp}°C, with the highest recorded temperature being {highest_temp}°C "
                f"and the lowest recorded temperature being {lowest_temp}°C.")
    
    elif table_name == "species":
        # Fetch the counts of sightings for the species at each site
        site_counts = {}
        predictions = fetch_related_records("predictions", "species_id", record['species_id'])
        for pred in predictions:
            images = fetch_related_records("images", "image_id", pred['image_id'])
            for img in images:
                site_id = img['site_id']
                site_info = fetch_related_records("sites", "site_id", site_id)
                if site_info:  # Check if site_info is not empty
                    site_name = site_info[0]['site_name']
                    
                    if site_name in site_counts:
                        site_counts[site_name] += 1  # Increment count if site already exists
                    else:
                        site_counts[site_name] = 1  # Initialize count if new site
                else:
                    logging.warning(f"No site information found for site_id {site_id}.")

        site_counts_list = ', '.join([f"{site}: {count}" for site, count in site_counts.items()]) if site_counts else "No sightings recorded"
        text = (f"Species {record['species_name']} is observed at the following sites with counts: {site_counts_list}.")

    else:
        return ""
    
    # Save the prepared text to a file
    with open(output_file, "a") as file:
        file.write(text + "\n")
    
    return text

# Generate and store embeddings in FAISS
def create_and_store_embeddings(batch_size=10, total_counts=None, temperature_trends=None):
    queries = {
        "images": "SELECT * FROM images",
        "sites": "SELECT * FROM sites",
        "species": "SELECT * FROM species",
        "predictions": "SELECT * FROM predictions"
    }

    dimension = 384
    index = faiss.IndexFlatL2(dimension)
    faiss_ids = []
    descriptions = []

    for table_name, query in queries.items():
        records = fetch_data(query)
        logging.info(f"Processing {len(records)} records from {table_name}...")

        for i in range(0, len(records), batch_size):
            batch_records = records[i:i + batch_size]
            texts = []
            current_faiss_ids = []

            for record in batch_records:
                text = prepare_text(record, table_name, temperature_trends)
                texts.append(text)

                if 'image_id' in record:
                    current_faiss_ids.append((table_name, record['image_id']))
                elif 'site_id' in record:
                    current_faiss_ids.append((table_name, record['site_id']))
                elif 'species_id' in record:
                    current_faiss_ids.append((table_name, record['species_id']))
                elif 'prediction_id' in record:
                    current_faiss_ids.append((table_name, record['prediction_id']))

            try:
                embeddings = model.encode(texts).astype("float32")
                # Check the number of embeddings generated
                if embeddings.shape[0] != len(batch_records):
                    logging.warning(f"Warning: Number of embeddings ({embeddings.shape[0]}) does not match number of records in batch ({len(batch_records)}).")

                index.add(embeddings)

                # Verify the index size after adding the embeddings
                new_index_size = index.ntotal
                logging.info(f"Successfully added batch {i // batch_size + 1} of {len(records) // batch_size + 1} from {table_name}. Current index size: {new_index_size}.")

                faiss_ids.extend(current_faiss_ids)
                descriptions.extend(texts)

            except Exception as e:
                logging.error(f"Failed to add batch {i // batch_size + 1} from {table_name}: {e}")
                continue  # Continue to the next batch even if this one fails

        records.clear()

    faiss.write_index(index, "semenggoh_faiss_index.bin")
    logging.info("FAISS index saved to disk.")

    with open("faiss_ids.npy", "wb") as f:
        np.save(f, np.array(faiss_ids, dtype=object))
    logging.info("FAISS IDs saved to disk.")

    with open("descriptions.npy", "wb") as f:
        np.save(f, np.array(descriptions, dtype=object))
    logging.info("Descriptions saved to disk.")

    logging.info("All embeddings generated and stored in FAISS.")

# Load the FAISS index and metadata from disk
def load_index_and_metadata():
    """Load FAISS index and metadata (IDs and descriptions) from disk."""
    index = faiss.read_index("semenggoh_faiss_index.bin")
    faiss_ids = np.load("faiss_ids.npy", allow_pickle=True)
    descriptions = np.load("descriptions.npy", allow_pickle=True)  # Fixed this line
    return index, faiss_ids, descriptions

# Search for similar entries based on an input question
def search_similar_entries(index, faiss_ids, descriptions, input_question, k=5):
    """Search for similar entries in the FAISS index based on the input question."""
    input_embedding = model.encode([input_question]).astype("float32")  # Get the embedding for the question
    D, I = index.search(input_embedding, k)  # Search the index for the top k similar entries
    return D, I  # Return distances and indices

# Main execution flow
if __name__ == "__main__":
    # Fetch total counts
    total_counts = fetch_total_counts()

    # Fetch temperature trends
    temperature_trends = fetch_temperature_trends()

    # Create and store embeddings
    create_and_store_embeddings(total_counts=total_counts, temperature_trends=temperature_trends)

    # Load index and metadata
    index, faiss_ids, descriptions = load_index_and_metadata()

    # Example of searching for similar entries
    question = "What species are found at site XYZ?"
    distances, indices = search_similar_entries(index, faiss_ids, descriptions, question)
    
    # Output the search results along with total counts
    print("\nSearch Results:")
    for idx in indices[0]:
        if idx >= 0:  # Ensure the index is valid
            print(f"- {descriptions[idx]} (Distance: {distances[0][idx]:.2f})")
