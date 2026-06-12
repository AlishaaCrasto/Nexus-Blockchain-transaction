import streamlit as st
import pandas as pd
import random
from datetime import datetime, timedelta

st.set_page_config(page_title="Nexus Admin", page_icon="⚡", layout="wide")

# --- Auth ---
if "admin_logged_in" not in st.session_state:
    st.session_state.admin_logged_in = False

if not st.session_state.admin_logged_in:
    st.title("⚡ NEXUS Admin")
    st.subheader("Admin Login")
    email = st.text_input("Email", placeholder="admin@nexus.in")
    password = st.text_input("Password", type="password", placeholder="admin123")
    if st.button("Login", use_container_width=True):
        if email == "admin@nexus.in" and password == "admin123":
            st.session_state.admin_logged_in = True
            st.rerun()
        else:
            st.error("Invalid credentials. Use admin@nexus.in / admin123")
    st.stop()

# --- Demo Data ---
def gen_tx_data():
    dates = [datetime.now() - timedelta(days=i) for i in range(30)]
    return pd.DataFrame({
        "Date": dates,
        "Volume (INR)": [random.randint(50000, 500000) for _ in dates],
        "Transactions": [random.randint(5, 80) for _ in dates],
    })

def gen_user_growth():
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return pd.DataFrame({
        "Month": months,
        "New Users": [random.randint(20, 120) for _ in months],
        "Active Users": [random.randint(100, 400) for _ in months],
    })

def gen_audit_log():
    statuses = ["SUCCESS", "SUCCESS", "SUCCESS", "FLAGGED", "FAILED"]
    actions = ["SEND", "RECEIVE", "LOGIN", "SWAP", "SEND"]
    return pd.DataFrame({
        "Timestamp": [datetime.now() - timedelta(minutes=i*15) for i in range(10)],
        "User": [f"0x{random.randint(1000,9999)}...{random.randint(1000,9999)}" for _ in range(10)],
        "Action": [random.choice(actions) for _ in range(10)],
        "Amount (INR)": [f"₹{random.randint(1000, 200000):,}" for _ in range(10)],
        "Status": [random.choice(statuses) for _ in range(10)],
        "Network": ["Sepolia Testnet"] * 10,
    })

tx_data = gen_tx_data()
user_data = gen_user_growth()
audit_data = gen_audit_log()

# --- Header ---
col1, col2 = st.columns([4, 1])
with col1:
    st.title("⚡ NEXUS Admin Dashboard")
with col2:
    if st.button("Logout"):
        st.session_state.admin_logged_in = False
        st.rerun()

st.divider()

# --- KPI Metrics ---
k1, k2, k3, k4 = st.columns(4)
k1.metric("Total Volume (INR)", "₹94,52,300", "+12.4%")
k2.metric("Active Users", "1,284", "+8.2%")
k3.metric("Transactions Today", "342", "+5.1%")
k4.metric("Flagged Transactions", "7", "-2")

st.divider()

# --- Charts ---
c1, c2 = st.columns(2)

with c1:
    st.subheader("Platform Transaction Volume")
    time_range = st.radio("Range", ["1W", "1M", "ALL"], horizontal=True, key="vol_range")
    n = 7 if time_range == "1W" else 30 if time_range == "1M" else 30
    st.area_chart(tx_data.head(n).set_index("Date")["Volume (INR)"])

with c2:
    st.subheader("User Growth")
    st.bar_chart(user_data.set_index("Month"))

st.divider()

# --- Audit Log ---
st.subheader("Audit Trail")

def color_status(val):
    if val == "FLAGGED":
        return "background-color: #FEF3C7; color: #92400E"
    elif val == "FAILED":
        return "background-color: #FEE2E2; color: #991B1B"
    return "background-color: #D1FAE5; color: #065F46"

st.dataframe(
    audit_data.style.applymap(color_status, subset=["Status"]),
    use_container_width=True,
    hide_index=True,
)

st.divider()

# --- System Log ---
st.subheader("System Log")
system_events = [
    {"Time": "13:38:01", "Event": "Blockchain node connected", "Level": "INFO"},
    {"Time": "13:35:22", "Event": "New transaction submitted: 0.5 ETH", "Level": "INFO"},
    {"Time": "13:20:10", "Event": "High value transaction flagged: ₹1,90,000", "Level": "WARN"},
    {"Time": "12:55:44", "Event": "User login: admin@nexus.in", "Level": "INFO"},
    {"Time": "12:10:33", "Event": "Sepolia RPC latency spike: 2400ms", "Level": "WARN"},
]
st.dataframe(pd.DataFrame(system_events), use_container_width=True, hide_index=True)
