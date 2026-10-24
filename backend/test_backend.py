import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("--- 1. Testing /api/health ---")
res = client.get("/api/health")
print("Status:", res.status_code)
print("Body:", res.json())
assert res.status_code == 200
assert res.json()["status"] == "online"

print("\n--- 2. Testing /api/explain-repo without key ---")
res_explain = client.post("/api/explain-repo", json={"repo_name": "facebook/react", "description": "UI library"})
print("Status:", res_explain.status_code)
print("Detail:", res_explain.json())
assert res_explain.status_code == 503

print("\n--- 3. Testing /api/explain-code without key ---")
res_code = client.post("/api/explain-code", json={"code": "def hello(): print('world')", "language": "python"})
print("Status:", res_code.status_code)
print("Detail:", res_code.json())
assert res_code.status_code == 503

print("\n--- 4. Testing /api/debug-screenshot without key (must NOT fake success) ---")
fake_img = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")
files = {"image": ("test_error.png", fake_img, "image/png")}
data = {"question": "Why is this crashing?"}
res_img = client.post("/api/debug-screenshot", files=files, data=data)
print("Status:", res_img.status_code)
print("Detail:", res_img.json())
assert res_img.status_code == 503

print("\n--- 5. Testing /api/debug-screenshot with invalid file format ---")
fake_txt = io.BytesIO(b"not an image")
files_bad = {"image": ("test.txt", fake_txt, "text/plain")}
res_bad = client.post("/api/debug-screenshot", files=files_bad, data=data)
print("Status:", res_bad.status_code)
print("Detail:", res_bad.json())
assert res_bad.status_code == 400

print("\nALL BACKEND REFINED TESTS PASSED SUCCESSFULLY!")
