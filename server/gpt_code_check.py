import openai
import os

# Paste your API key here directly or use os.environ['OPENAI_API_KEY']

# Load code from a local file (e.g., clientForm.js)
with open("clientForm.js", "r") as f:
    code = f.read()

# Construct the review prompt
prompt = f"""You're a code reviewer. Please check the following JavaScript code for:
1. Missing logic
2. Common bugs or errors
3. Failure to save or display form input
Only respond with actionable developer feedback.

```javascript
{code}
```"""

# Send to OpenAI
response = openai.ChatCompletion.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "user", "content": prompt}
    ]
)

# Print GPT feedback
print("\n🧠 GPT Review:\n")
print(response.choices[0].message.content)
