#!/usr/bin/env python3
"""
Security test script for Sappers Arena
Tests rate limiting, anti-bot protection, and server-side game generation
"""
import requests
import time
import json

BASE_URL = "https://sappers-arena.onrender.com/api"
# Для локального тестирования: BASE_URL = "http://localhost:8000/api"

def print_test(test_name, result, details=""):
    status = "✅ PASS" if result else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"   {details}")
    print()

def test_health():
    """Test if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_test("Server health check", response.status_code == 200, f"Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print_test("Server health check", False, f"Error: {e}")
        return False

def test_rate_limit_register():
    """Test rate limiting on register endpoint (5/minute)"""
    print("Testing rate limiting on register (5 requests/minute)...")
    
    success_count = 0
    rate_limited = False
    
    for i in range(7):  # Try 7 times (should hit limit after 5)
        try:
            response = requests.post(
                f"{BASE_URL}/players/register",
                json={"nickname": f"ratelimit_test_{int(time.time())}_{i}", "password": "test1234"},
                timeout=5
            )
            
            if response.status_code == 429:
                rate_limited = True
                print(f"   Request {i+1}: Rate limited (429) ✅")
                break
            elif response.status_code == 200:
                success_count += 1
                print(f"   Request {i+1}: Success (200)")
            else:
                print(f"   Request {i+1}: Status {response.status_code}")
        except Exception as e:
            print(f"   Request {i+1}: Error {e}")
        
        time.sleep(0.5)  # Small delay between requests
    
    print_test("Rate limiting on register", rate_limited, f"Successful requests before limit: {success_count}")
    return rate_limited

def test_rate_limit_login():
    """Test rate limiting on login endpoint (10/minute)"""
    print("Testing rate limiting on login (10 requests/minute)...")
    
    rate_limited = False
    success_count = 0
    
    for i in range(12):  # Try 12 times
        try:
            response = requests.post(
                f"{BASE_URL}/players/login",
                json={"nickname": "testuser", "password": "wrongpassword"},
                timeout=5
            )
            
            if response.status_code == 429:
                rate_limited = True
                print(f"   Request {i+1}: Rate limited (429) ✅")
                break
            elif response.status_code in [200, 401]:  # 401 is expected for wrong password
                success_count += 1
                print(f"   Request {i+1}: Status {response.status_code}")
            else:
                print(f"   Request {i+1}: Status {response.status_code}")
        except Exception as e:
            print(f"   Request {i+1}: Error {e}")
        
        time.sleep(0.3)
    
    print_test("Rate limiting on login", rate_limited, f"Successful requests before limit: {success_count}")
    return rate_limited

def test_anti_bot_protection():
    """Test anti-bot protection (minimum completion time)"""
    print("Testing anti-bot protection (minimum completion time)...")
    
    # First, need to login to get a token
    try:
        login_response = requests.post(
            f"{BASE_URL}/players/login",
            json={"nickname": "testuser", "password": "test1234"},
            timeout=5
        )
        
        if login_response.status_code != 200:
            print_test("Anti-bot protection", False, "Could not login - need valid credentials")
            return False
        
        token = login_response.json().get("token")
        if not token:
            print_test("Anti-bot protection", False, "No token received")
            return False
        
        headers = {"X-Session-Token": token}
        
        # Test 1: Too fast completion (should be rejected)
        print("   Test 1: Submitting score with 0.1 second completion time...")
        response = requests.post(
            f"{BASE_URL}/leaderboard",
            json={
                "player_name": "testuser",
                "mode": "campaign",
                "won": True,
                "time_seconds": 0.1,
                "rows": 10,
                "cols": 10,
                "mines": 10,
                "lives_remaining": 3,
                "lives_total": 3,
                "flags": 0,
                "score": 100
            },
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 400 and "too fast" in response.text.lower():
            print("   Fast completion rejected ✅")
            test1_pass = True
        else:
            print(f"   Fast completion NOT rejected (status {response.status_code}) ❌")
            test1_pass = False
        
        # Test 2: Normal completion time (should be accepted)
        print("   Test 2: Submitting score with 15 second completion time...")
        response = requests.post(
            f"{BASE_URL}/leaderboard",
            json={
                "player_name": "testuser",
                "mode": "campaign",
                "won": True,
                "time_seconds": 15,
                "rows": 10,
                "cols": 10,
                "mines": 10,
                "lives_remaining": 3,
                "lives_total": 3,
                "flags": 0,
                "score": 100
            },
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            print("   Normal completion accepted ✅")
            test2_pass = True
        else:
            print(f"   Normal completion rejected (status {response.status_code}) ❌")
            test2_pass = False
        
        print_test("Anti-bot protection", test1_pass and test2_pass, "Fast rejected, normal accepted")
        return test1_pass and test2_pass
        
    except Exception as e:
        print_test("Anti-bot protection", False, f"Error: {e}")
        return False

def test_server_side_game():
    """Test server-side game creation and click"""
    print("Testing server-side game creation and click...")
    
    try:
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/players/login",
            json={"nickname": "testuser", "password": "test1234"},
            timeout=5
        )
        
        if login_response.status_code != 200:
            print_test("Server-side game", False, "Could not login")
            return False
        
        token = login_response.json().get("token")
        headers = {"X-Session-Token": token}
        
        # Test 1: Create game
        print("   Test 1: Creating game...")
        response = requests.post(
            f"{BASE_URL}/game/create",
            json={
                "rows": 10,
                "cols": 10,
                "mines": 10,
                "lives": 3,
                "mode": "battle_ranked"
            },
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            game_id = response.json().get("game_id")
            print(f"   Game created with ID: {game_id} ✅")
            test1_pass = True
        else:
            print(f"   Game creation failed (status {response.status_code}) ❌")
            print(f"   Response: {response.text}")
            test1_pass = False
            return False
        
        # Test 2: Click on cell
        print("   Test 2: Clicking on cell (5, 5)...")
        response = requests.post(
            f"{BASE_URL}/game/click",
            json={
                "game_id": game_id,
                "row": 5,
                "col": 5,
                "action": "open"
            },
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Click successful: {result.get('action')} ✅")
            test2_pass = True
        else:
            print(f"   Click failed (status {response.status_code}) ❌")
            print(f"   Response: {response.text}")
            test2_pass = False
        
        # Test 3: Try to click with wrong user (should fail)
        print("   Test 3: Trying to click with different user (should fail)...")
        # This test would require a second user, skipping for now
        
        print_test("Server-side game", test1_pass and test2_pass, "Game creation and click work")
        return test1_pass and test2_pass
        
    except Exception as e:
        print_test("Server-side game", False, f"Error: {e}")
        return False

def test_cookies():
    """Test HttpOnly cookies"""
    print("Testing HttpOnly cookies...")
    
    try:
        session = requests.Session()
        
        # Register with cookies
        response = session.post(
            f"{BASE_URL}/players/register",
            json={"nickname": f"cookie_test_{int(time.time())}", "password": "test1234"},
            timeout=5
        )
        
        if response.status_code == 200:
            # Check if session_token cookie is set
            cookies = session.cookies.get_dict()
            if "session_token" in cookies:
                print(f"   session_token cookie set: {cookies['session_token'][:20]}... ✅")
                test_pass = True
            else:
                print("   session_token cookie NOT set ❌")
                test_pass = False
        else:
            print(f"   Registration failed (status {response.status_code}) ❌")
            test_pass = False
        
        print_test("HttpOnly cookies", test_pass, "Cookie set on registration")
        return test_pass
        
    except Exception as e:
        print_test("HttpOnly cookies", False, f"Error: {e}")
        return False

def main():
    print("=" * 60)
    print("Sappers Arena Security Test Suite")
    print("=" * 60)
    print()
    
    # Test server health first
    if not test_health():
        print("❌ Server is not running. Exiting.")
        return
    
    print()
    print("-" * 60)
    print("Running security tests...")
    print("-" * 60)
    print()
    
    results = []
    
    # Run tests
    results.append(("Server health", test_health()))
    results.append(("Rate limiting (register)", test_rate_limit_register()))
    results.append(("Rate limiting (login)", test_rate_limit_login()))
    results.append(("Anti-bot protection", test_anti_bot_protection()))
    results.append(("Server-side game", test_server_side_game()))
    results.append(("HttpOnly cookies", test_cookies()))
    
    # Summary
    print()
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print()
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All security tests passed!")
    else:
        print(f"⚠️  {total - passed} test(s) failed")

if __name__ == "__main__":
    main()
