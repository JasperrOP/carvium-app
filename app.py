import flask
import os
from flask import Flask, request, render_template, jsonify
import joblib
import pandas as pd
import json
from flask import send_from_directory
app = Flask(__name__)

# --- Load Model and Columns ---
try:
    model = joblib.load("car_price_model.pkl")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

try:
    with open("model_columns.json", "r") as f:
        model_columns = json.load(f)
    print(f"Model columns loaded successfully: {model_columns}")
except Exception as e:
    print(f"Error loading model_columns.json: {e}")
    model_columns = None # Handle error

# --- Encodings (same as training) ---
company_map = {
    'Maruti': 1, 'Skoda': 2, 'Honda': 3, 'Hyundai': 4, 'Toyota': 5, 'Ford': 6, 'Renault': 7,
    'Mahindra': 8, 'Tata': 9, 'Chevrolet': 10, 'Datsun': 11, 'Jeep': 12, 'Mercedes-Benz': 13,
    'Mitsubishi': 14, 'Audi': 15, 'Volkswagen': 16, 'BMW': 17, 'Nissan': 18, 'Lexus': 19,
    'Jaguar': 20, 'Land': 21, 'MG': 22, 'Volvo': 23, 'Daewoo': 24, 'Kia': 25, 'Fiat': 26,
    'Force': 27, 'Ambassador': 28, 'Ashok': 29, 'Isuzu': 30, 'Opel': 31
}
fuel_map = {'Petrol': 1, 'Diesel': 2, 'CNG': 3, 'LPG': 4, 'Electric': 5}
seller_map = {'Dealer': 1, 'Individual': 2, 'Trustmark Dealer': 3}
trans_map = {'Manual': 1, 'Automatic': 2}
owner_map = {'First Owner': 1, 'Second Owner': 2, 'Third Owner': 3, 'Fourth & Above Owner': 4, 'Test Drive Car': 5}

# --- App Routes ---

@app.route('/')
def home():
    """Renders the homepage."""
    return render_template('index.html')
@app.route('/dataset')
def dataset():
    """Render a page showing dataset preview."""
    df = pd.read_csv("static/Cardetails_realistic_2025.csv")
    
    data_html = df.head(50).to_html(classes='table table-dark table-striped', index=False)
    return render_template('dataset.html', table=data_html)


@app.route('/download_dataset')
def download_dataset():
    return send_from_directory('static', 'Cardetails_realistic_2025.csv', as_attachment=True)

@app.route('/predict', methods=['POST'])
def predict():
    """Receives form data, processes it, and returns a prediction as JSON."""
    
    if not model or not model_columns:
        return jsonify({'error': "Error: Model is not loaded. Please check server logs."})

    try:
        # 1. Create a dictionary from the form data and encode it
        data = {
            'name': company_map.get(request.form['name'], 0),
            'year': int(request.form['year']),
            'km_driven': int(request.form['km_driven']),
            'fuel': fuel_map.get(request.form['fuel'], 0),
            'seller_type': seller_map.get(request.form['seller_type'], 0),
            'transmission': trans_map.get(request.form['transmission'], 0),
            'owner': owner_map.get(request.form['owner'], 0),
            'mileage': float(request.form['mileage']),
            'engine': float(request.form['engine']),
            'max_power': float(request.form['max_power']),
            'seats': int(request.form['seats'])
        }

        # 2. Convert to DataFrame
        df = pd.DataFrame(data, index=[0])

        # 3. Reorder DataFrame columns to match the model's training order
        df = df[model_columns]

        # 4. Make prediction
        prediction = model.predict(df)
        output = round(prediction[0], 2)

        # 5. Format the output
        prediction_text = f"Estimated Car Price: ₹ {output:,.2f}"
        
        return jsonify({'prediction': prediction_text})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': f"Error: Invalid input. Please check all fields. ({e})"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
