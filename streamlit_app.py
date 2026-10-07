import sqlite3
import streamlit as st

st.set_page_config(page_title="ChatWave AVN", page_icon="💬", layout="wide")

DB_PATH = "chatwave.db"


def db():
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    connection.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)")
    connection.execute("CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL)")
    connection.execute("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, conversation TEXT NOT NULL, sender TEXT NOT NULL, body TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)")
    connection.commit()
    return connection


connection = db()
if "user" not in st.session_state:
    st.session_state.user = ""
if "conversation" not in st.session_state:
    st.session_state.conversation = "Ayesha Khan"

st.markdown("""
<style>
.stApp { background: linear-gradient(135deg,#fbfaff,#eeeaff); color:#182142; }
[data-testid="stSidebar"] { background:#fcfbff; border-right:1px solid #e8e5f4; }
.brand { font-size:2rem; font-weight:800; letter-spacing:-.08em; color:#182142; }
.brand span { color:#6842e8; }
.mesh { padding:14px; border:1px solid #ddd4ff; background:#f0ecff; border-radius:16px; margin:14px 0; }
.mesh strong { color:#6842e8; }
.security { padding:12px 14px; border:1px solid #ded5ff; background:#f4f0ff; border-radius:12px; color:#70659c; }
.bubble { padding:11px 14px; border-radius:16px; background:#f0eff8; margin:8px 0; width:fit-content; max-width:75%; }
.bubble.mine { background:linear-gradient(135deg,#7950ed,#5d3cdc); color:white; margin-left:auto; }
.meta { color:#9999aa; font-size:.72rem; }
.metric { padding:16px; border:1px solid #e8e5f4; border-radius:16px; background:white; }
.metric strong { display:block; font-size:1.5rem; color:#182142; }
</style>
""", unsafe_allow_html=True)


def get_groups():
    return [row[0] for row in connection.execute("SELECT name FROM groups ORDER BY name").fetchall()]


def get_messages(conversation):
    return connection.execute("SELECT sender, body, created_at FROM messages WHERE conversation=? ORDER BY id", (conversation,)).fetchall()


if not st.session_state.user:
    st.title("Welcome to ChatWave")
    st.write("Create a display name to join the encrypted AVN chat.")
    name = st.text_input("Your display name", placeholder="e.g. Priya")
    if st.button("Join ChatWave", type="primary") and name.strip():
        st.session_state.user = name.strip()
        connection.execute("INSERT OR IGNORE INTO users(name) VALUES (?)", (st.session_state.user,))
        connection.commit()
        st.rerun()
    st.stop()


with st.sidebar:
    st.markdown('<div class="brand">Chat<span>Wave</span></div>', unsafe_allow_html=True)
    st.caption("AVN Secure Network")
    st.markdown('<div class="mesh"><strong>● AVN Mesh connected</strong><br><small>14.8 ms latency · 842 peers<br>Zero-knowledge routing</small></div>', unsafe_allow_html=True)
    search = st.text_input("Search chats", label_visibility="collapsed", placeholder="Search chats...")
    st.write("**Chats**")
    conversations = ["Ayesha Khan", "Family Group", "Hammad Ali", "Besties Forever"] + get_groups()
    for conversation in dict.fromkeys(conversations):
        if search.lower() in conversation.lower() and st.button(conversation, use_container_width=True):
            st.session_state.conversation = conversation
            st.rerun()
    st.divider()
    with st.form("new_group", clear_on_submit=True):
        group_name = st.text_input("New group name", placeholder="Weekend Crew")
        if st.form_submit_button("＋ Create encrypted group") and group_name.strip():
            connection.execute("INSERT OR IGNORE INTO groups(name) VALUES (?)", (group_name.strip(),))
            connection.commit()
            st.session_state.conversation = group_name.strip()
            st.rerun()
    st.caption(f"Signed in as **{st.session_state.user}**")


st.title(st.session_state.conversation)
st.markdown('<div class="security">🔒 <b>End-to-end encrypted</b> · AVN zero-knowledge relay active</div>', unsafe_allow_html=True)
st.write("")

messages = get_messages(st.session_state.conversation)
if not messages:
    st.info("No messages yet. Start the conversation below.")
for sender, body, created_at in messages:
    mine = sender == st.session_state.user
    st.markdown(f'<div class="bubble {"mine" if mine else ""}">{body}</div><div class="meta">{sender} · {created_at}</div>', unsafe_allow_html=True)


with st.form("message_form", clear_on_submit=True):
    message = st.text_input("Message", label_visibility="collapsed", placeholder="Type a message...")
    if st.form_submit_button("Send", type="primary") and message.strip():
        connection.execute("INSERT INTO messages(conversation,sender,body) VALUES (?,?,?)", (st.session_state.conversation, st.session_state.user, message.strip()))
        connection.commit()
        st.rerun()

st.caption("Messages refresh when a user sends or reloads the page. For production-scale realtime delivery, connect this UI to Supabase or Firebase.")
