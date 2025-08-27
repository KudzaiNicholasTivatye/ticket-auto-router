from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# -----------------------------
# 1) Input data models
# -----------------------------
class Ticket(BaseModel):
    subject: str
    body: str

class SimpleTicket(BaseModel):
    text: str

class FlexibleTicket(BaseModel):
    subject: Optional[str] = ""
    body: Optional[str] = ""
    text: Optional[str] = ""

# -----------------------------
# 2) FastAPI app
# -----------------------------
app = FastAPI(title="Ticket Auto-Router with Triage")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# 3) Prepare dataset (same as before)
# -----------------------------
data = {
    "subject": [
        # Billing
        "Refund not received", "Double payment issue", "Invoice missing", 
        "Overcharged on bill", "Subscription cancellation refund", "Payment failed", 
        "Refund taking too long", "Credit card declined", "Incorrect invoice", "Billing discrepancy",
        "Extra charge on my account", "Need receipt for payment",

        # Tech Support
        "App keeps crashing", "Unable to login", "Bug in checkout page", 
        "Website down", "Password reset not working", "Error message on screen", 
        "App freezing", "Feature not loading", "Connectivity issue", "Mobile app bug",
        "Software update failed", "Cannot access dashboard",

        # Sales
        "Need bulk purchase info", "Upgrade plan details", "Discount for 100 units", 
        "Pricing inquiry", "Do you offer student discounts?", "Requesting enterprise plan quote", 
        "Need sales consultation", "Looking for reseller information", "Want to try premium plan", 
        "Quote request for 200 licenses", "Do you offer yearly plan?", "Partner program details",

        # Shipping
        "Order shipment delayed", "Package not delivered", "Tracking number invalid", 
        "Delivery taking too long", "Courier lost my package", "Shipment status not updating", 
        "Package damaged on arrival", "Order stuck in transit", "Need faster delivery", 
        "Parcel held at customs", "Shipment missing items", "Late delivery complaint"
    ],
    "body": [
        # Billing
        "Refund still not processed after one week.",
        "Payment was deducted twice from my credit card.",
        "I cannot download my invoice for last month's payment.",
        "My bill shows higher amount than expected.",
        "I cancelled my subscription but was charged again.",
        "My payment did not go through successfully.",
        "Refund is taking more than 14 days.",
        "My card keeps getting declined when paying.",
        "The invoice details are incorrect.",
        "I noticed a discrepancy in the billing amount.",
        "There is an extra charge on my statement.",
        "Please send me a receipt for last payment.",

        # Tech Support
        "Mobile app crashes every time I open it.",
        "I reset password but still can't login.",
        "Checkout button doesn't work on website.",
        "The website is down and not loading.",
        "Password reset link is not working.",
        "I get an error message while using the service.",
        "The app freezes whenever I click on settings.",
        "The dashboard feature won't load.",
        "Having connectivity problems with the app.",
        "Bug in mobile app after update.",
        "Software update installation failed.",
        "I cannot access the analytics dashboard.",

        # Sales
        "Do you offer bulk order discounts?",
        "How can I upgrade my subscription plan?",
        "Looking for quote on large orders.",
        "I want to know the pricing options available.",
        "Do you provide discounts for students?",
        "I need a quote for an enterprise plan.",
        "Can I speak with a sales representative?",
        "Looking for reseller partnership info.",
        "Interested in trying premium package.",
        "Need a quote for 200 software licenses.",
        "Do you provide a yearly payment plan?",
        "Tell me more about your partner program.",

        # Shipping
        "Order was supposed to arrive yesterday but hasn't.",
        "My package never arrived even after shipping email.",
        "Tracking number shows invalid status.",
        "Delivery has been delayed for a week.",
        "Courier lost my order package.",
        "Shipment tracking status is not updating.",
        "My parcel arrived damaged.",
        "Order stuck at transit facility.",
        "I need faster shipping option.",
        "Customs is holding my shipment.",
        "My delivery is missing items.",
        "Delivery was late and unacceptable."
    ],
    "department_label": (
        ["Billing"] * 12 +
        ["Tech Support"] * 12 +
        ["Sales"] * 12 +
        ["Shipping"] * 12
    )
}

df = pd.DataFrame(data)

# -----------------------------
# 4) Train classifier
# -----------------------------
X = df["subject"] + " " + df["body"]
y = df["department_label"]

model = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression(max_iter=1000))
])

model.fit(X, y)

# -----------------------------
# 5) Flexible prediction endpoint
# -----------------------------
@app.post("/predict")
def predict(ticket: FlexibleTicket):
    # Handle different input formats
    if ticket.text:
        # If single text field is provided
        text = ticket.text
    else:
        # If subject and body are provided
        text = (ticket.subject or "") + " " + (ticket.body or "")
    
    # Handle empty input
    if not text.strip():
        return {
            "department": "Error",
            "confidence": 0
        }
    
    try:
        probs = model.predict_proba([text])[0]
        pred_idx = probs.argmax()
        predicted_label = model.classes_[pred_idx]
        confidence = float(probs[pred_idx])

        # Low-confidence triage
        threshold = 0.3
        if confidence < threshold:
            predicted_label = "Triage"

        return {
            "department": predicted_label,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return {
            "department": "Error",
            "confidence": 0
        }

# Add a test endpoint
@app.get("/")
def read_root():
    return {"message": "Ticket Auto-Router API is running"}

# Add a health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}