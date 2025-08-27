import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# Expanded dataset with more samples per class
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
        "I cannot download my invoice for last month’s payment.",
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
        "I reset password but still can’t login.",
        "Checkout button doesn’t work on website.",
        "The website is down and not loading.",
        "Password reset link is not working.",
        "I get an error message while using the service.",
        "The app freezes whenever I click on settings.",
        "The dashboard feature won’t load.",
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
        "Order was supposed to arrive yesterday but hasn’t.",
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

# Split dataset (stratified)
X_train, X_test, y_train, y_test = train_test_split(
    df["subject"] + " " + df["body"], 
    df["department_label"],
    test_size=0.25, 
    random_state=42, 
    stratify=df["department_label"]
)

# Model pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression(max_iter=1000))
])

# Train
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# Try new tickets
new_tickets = [
    "Payment was deducted twice from my card",
    "Website shows error when logging in",
    "I want to place a large order of 200 units",
    "My package hasn’t arrived yet"
]

predictions = model.predict(new_tickets)

print("\nPredictions for new tickets:")
for ticket, pred in zip(new_tickets, predictions):
    print(f"- {ticket} → {pred}")
