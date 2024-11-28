import os
import cv2
import numpy as np
import torch
from flask import Flask, request, render_template, redirect, Response, url_for
from ultralytics import YOLO
from torchvision import models, transforms
import torch.nn as nn
from PIL import Image
from io import BytesIO
import base64
import google.generativeai as genai

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULT_FOLDER'] = os.path.join('static', 'results')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

# Load YOLOv8 model and ResNet model
yolo_model_path = "C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (user)\\image_vd_prediction\\best.pt"
yolo_model = YOLO(yolo_model_path)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
resnet_model = models.resnet50(weights='IMAGENET1K_V1')
num_ftrs = resnet_model.fc.in_features
resnet_model.fc = nn.Linear(num_ftrs, 64)  # Adjust output size as needed
resnet_model.load_state_dict(torch.load("C:\\Users\\darre\\OneDrive\\Documents\\Computing Technology Innovation Project\\React JS\\Semenggoh Website\\Semenggoh Website\\Chatbot (user)\\image_vd_prediction\\resnet50_model.pth", map_location=device))
resnet_model.to(device)
resnet_model.eval()

# Set environment variables
os.environ['GOOGLE_API_KEY'] = 'AIzaSyBUXU28xMS8L00QioB7NlNG4KX2gkmD3aI'
google_api_key = os.getenv('GOOGLE_API_KEY')

# Ensure token is available
if not google_api_key:
    raise ValueError("Please set the GOOGLE_API_KEY environment variable")

# Configure Google GenerativeAI model
genai.configure(api_key=google_api_key)
google_model = genai.GenerativeModel('gemini-1.0-pro')

# Define preprocessing for ResNet
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Define a dictionary to map class IDs to class names
class_mapping = {
    0: 'asian black hornbill',
    1: 'babbler',
    2: 'banded civet',
    3: 'banded langur',
    4: 'banded linsang',
    5: 'bay cat',
    6: 'bearcat',
    7: 'bearded pig',
    8: 'bird',
    9: 'blue banded pitta',
    10: 'bornean crested fireback',
    11: 'bornean ground cuckoo',
    12: 'bornean porcupine',
    13: 'bornean yellow muntjac',
    14: 'bulwer pheasant',
    15: 'clouded leopard',
    16: 'crested serpent eagle',
    17: 'dog',
    18: 'dove',
    19: 'emerald dove',
    20: 'great argus pheasant',
    21: 'ground squirrel',
    22: 'horse tail squirrel',
    23: 'human',
    24: 'kinabalu squirrel',
    25: 'leopard cat',
    26: 'long-tailed macaque',
    27: 'long-tailed porcupine',
    28: 'malayan civet',
    29: 'malayan weasel',
    30: 'marbled cat',
    31: 'maroon langur',
    32: 'masked palm civet',
    33: 'mice',
    34: 'mongoose',
    35: 'monitor lizard',
    36: 'moonrat',
    37: 'mousedeer',
    38: 'muntjac',
    39: 'orangutan',
    40: 'otter civet',
    41: 'palm civet',
    42: 'pangolin',
    43: 'pig-tailed macaque',
    44: 'pigeon',
    45: 'porcupine',
    46: 'rat',
    47: 'red muntjac',
    48: 'roughneck monitor lizard',
    49: 'roulroul',
    50: 'sambar deer',
    51: 'slow lorris',
    52: 'small-toothed palm civet',
    53: 'squirrel',
    54: 'sunbear',
    55: 'sunda pangolin',
    56: 'teledu',
    57: 'thick-spined porcupine',
    58: 'three-striped ground squirrel',
    59: 'treeshrew',
    60: 'tufted ground squirrel',
    61: 'white fronted langur',
    62: 'white-rumped shama',
    63: 'yellow-throated marten',
}

def get_species_name(class_index):
    return class_mapping.get(class_index, "Unknown")

def get_species_info(species_name):
    """Generate educational information about a species using general knowledge."""
    context = (
        "Start the response with a 'Did you know?' phrase, and then provide essential details about the species, "
        "such as Appearance, Habitat, Behavior, Conservation Status, and other interesting facts. "
        "Ensure that each section is described in full sentences without using lists or dashes. "
        "For each section, describe the species' features clearly and concisely, making the information engaging and easy to understand. "
        "Ensure that each section is separated by a line break using the '<br>' tag. "
        "Bold appropriate texts using '<strong>' tag for emphasis. "
        "Keep the response informative, accurate, and engaging, as though you're sharing fascinating facts with someone eager to learn. "
        "The information should be clear, easy to follow, and organized into distinct sections, each clearly labeled. "
        "Ensure the content flows naturally and doesn't rely on bullet points or list formatting. "
        "For each section, avoid the use of bullet points and instead focus on providing detailed, well-structured sentences.\n\n"
        f"Species: {species_name}\n\n"
    )

    response = google_model.generate_content(context)
    cleaned_response = response.text.replace('*', '')
    return cleaned_response if response else f"Sorry, I couldn't find information for {species_name}."

def process_image(image_path):
    image = cv2.imread(image_path)
    pred = yolo_model.predict(source=image_path, conf=0.4)

    if pred and hasattr(pred[0], 'boxes'):
        boxes = pred[0].boxes
        if boxes.data.size(0) > 0:
            for i, box in enumerate(boxes.data):
                if box.shape[0] == 6:
                    x1, y1, x2, y2, conf, class_id = box.tolist()

                    # Crop the detected object
                    cropped_image = image[int(y1):int(y2), int(x1):int(x2)]
                    pil_image = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))

                    # Convert cropped image to base64
                    buffered = BytesIO()
                    pil_image.save(buffered, format="JPEG")
                    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

                    # Perform ResNet prediction
                    cropped_image_tensor = preprocess(pil_image).unsqueeze(0).to(device)
                    with torch.no_grad():
                        outputs = resnet_model(cropped_image_tensor)
                        _, predicted = torch.max(outputs, 1)
                        species = get_species_name(predicted.item())

                    return img_str, species  # Return base64 image string and species name
    return None, "No objects detected"

# Streaming function to yield frames as they're processed
def stream_video(video_path):
    cap = cv2.VideoCapture(video_path)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Use YOLOv8 to detect objects and get bounding boxes
        pred = yolo_model.predict(source=frame, conf=0.4)
        if pred and hasattr(pred[0], 'boxes'):
            boxes = pred[0].boxes
            for box in boxes.data:
                if box.shape[0] == 6:
                    x1, y1, x2, y2, conf, class_id = box.tolist()

                    # Crop the detected region for ResNet classification
                    cropped_image = frame[int(y1):int(y2), int(x1):int(x2)]
                    pil_image = Image.fromarray(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
                    cropped_image_tensor = preprocess(pil_image).unsqueeze(0).to(device)

                    # Use ResNet to classify the cropped image
                    with torch.no_grad():
                        outputs = resnet_model(cropped_image_tensor)
                        _, predicted = torch.max(outputs, 1)
                        species = get_species_name(predicted.item())

                    # Print the prediction to the console
                    print(f"ResNet Prediction - Bounding Box (x1: {x1}, y1: {y1}, x2: {x2}, y2: {y2}) -> Species: {species}")

                    # Draw bounding box and species label on the frame
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    cv2.putText(frame, species, (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Encode frame as JPEG
        _, jpeg = cv2.imencode('.jpg', frame)
        frame_bytes = jpeg.tobytes()

        # Yield frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route('/')
def upload_form():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        return redirect(request.url)

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Check if the uploaded file is an image
    if file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        img_str, species = process_image(file_path)
        # Get educational information about the predicted species
        species_info = get_species_info(species)
        return render_template('image_predictions.html', image=img_str, species=species, species_info=species_info)
    
    # Check if the uploaded file is a video
    elif file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
        return render_template('video_predictions.html', video_path=file_path)
    
    # If file format is unsupported, render the upload page with an error message
    else:
        return render_template('upload.html', error="Unsupported file format. Please upload a valid image or video.")

@app.route('/video_feed/<path:video_path>')
def video_feed(video_path):
    return Response(stream_video(video_path),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)