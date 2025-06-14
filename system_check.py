import openai

def check_system_with_chatgpt(system_description):
    prompt = [
        {"role": "system", "content": "You are a senior developer and cancer exercise safety specialist. Your job is to review code and logic for safety, bugs, and performance issues."},
        {"role": "user", "content": f"Here’s what the app has done so far:\n\n{system_description}\n\nPlease check for bugs, safety issues, logic errors, or improvement opportunities. Respond clearly and concisely."}
    ]

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=prompt,
        temperature=0.2
    )

    return response['choices'][0]['message']['content']
system_description = """
This is a cancer-focused web app built in Replit. Its purpose is to provide safe, personalised exercise programs for users recovering from cancer.

1. User Input & Assessment:
- User selects cancer type and treatment stage
- Inputs fatigue, energy, mobility, and symptoms (scale 1–5)

2. AI Exercise Prescription Page:
- Uses ChatGPT via OpenAI API
- Custom plan with warm-up, main workout, cooldown, safety notes
- Adjusts intensity and type of exercise based on user profile
- Applies ACSM cancer exercise guidelines

3. Exercise Library:
- Matches CSV/JSON exercise data
- Provides YouTube links and short instructions
- Currently opens videos in new tabs

4. Safety Logic:
- Reduces load if fatigue > 3, pain > 2, or mobility < 3
- Avoids risky movements for lymphoedema or balance issues

5. Interface:
- Built in Replit with Python and HTML
- Uses OPENAI_API_KEY stored as a secret
- Includes ‘Play’ buttons and personalised feedback from GPT

6. Goal:
- Help cancer survivors move safely with confidence
- Target: UK-based users post-treatment

Please check this for bugs, logic errors, safety gaps, or anything we missed.
"""

print(check_system_with_chatgpt(system_description))



