from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

client = OpenAI()  # reads OPENAI_API_KEY from environment

@app.route("/evaluate", methods=["POST"])
def evaluate_idea():
    data = request.get_json()

    if not data or "idea" not in data:
        return jsonify({"error": "Missing 'idea' in request body"}), 400

    idea_text = data["idea"]

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a startup evaluator."},
                {"role": "user", "content": f"Evaluate this startup idea:\n{idea_text}"}
            ],
            max_tokens=200,
            temperature=0.7,
        )

        evaluation = response.choices[0].message.content.strip()

        return jsonify({"evaluation": evaluation})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
