# Family Location Alert

> A simple way for me to know when my son or little brother is more than 5 miles away from me.

**Author:** Adnan Abdul Razak Iddrisu · **Course:** CMP 464/343 Product 1 · **Last updated:** October 7, 2026

---

## 1. About Me (the User)

I am a family member who wants to keep an eye on where my son or little brother is, especially when we are not together. I usually rely on Find My when I want to check their location, but I do not always remember to check it.

**The last 3 times this happened:**

1. It was around 9 PM, and I was at work when my elderly brother called to ask if I had seen my little brother before leaving for work. At that moment, we did not know what to do or where to begin looking for him. I really wished I had his location because it was getting late. He did not come home until around 11 PM.

2. One afternoon, I was sleeping, and when I woke up, my little brother was nowhere to be found. Apparently, he had gone to play soccer with some new friends.

3. There have also been many occasions when he leaves to play with friends while I am doing my normal daily activities. I would really like to know if he is going directly to the playground or if he goes somewhere else afterward.

**What it costs me:**

- ⏱️ Time: I have to stop what I am doing and manually check their location.
- 💸 Money: No direct cost.
- 🔋 Energy: It can be stressful having to remember to check on them.
- 🙂 Joy: I feel more worried when I do not know where they are.

---

## 2. Problem Statement

**Gut check:**

> I need a simple way to know when my son or little brother gets more than 5 miles away because I sometimes forget or get distracted and do not check Find My.

**Five Whys:**

1. Why do I need to know when they are far away?

   Because I want to know where they are when they are not close to me.

2. Why don't I always know where they are?

   Because I do not always remember to check Find My.

3. Why don't I remember to check?

   Because I can get busy, distracted, or focused on other things.

4. Why does that matter?

   Because I may not realize that they have moved farther away from me.

5. Why would an alert help?

   Because it would remind me right away so I can check their current location.

**Problem statement:**

> **When** I am busy or distracted during the day,  
> **I struggle to** remember to check my son or little brother's location,  
> **which costs me** time and can cause unnecessary worry.  
> **This happens because** I have to remember to manually check their location.  
> **Right now I** use Find My to check their location, **but** I have to remember to open it myself.

**I'll know this is solved when:** I get an alert when my son or little brother moves more than 5 miles away from me and can immediately check their current location.

---

## 3. Existing Solutions

| What I use or tried | What it does well | Why it falls short for me |
|---|---|---|
| Find My | Shows me their current location | I have to remember to open it and check |
| Calling or texting | Lets me ask where they are | I may not want to bother them just to ask their location |
| Asking another family member | Can help me find out where they are | It takes time and depends on someone else knowing |

**The gap:** I need something that reminds me when they move farther away instead of me having to remember to check their location myself.

---

## 4. Features & Benefits

| Feature (what it does) | Benefit (how my life gets better) | MVP or Later? |
|---|---|---|
| Set a 5-mile distance limit | I know when my family member moves farther away | MVP |
| Distance alert | Reminds me to check their location when they are more than 5 miles away | MVP |
| See their current location | Lets me quickly see where they are after getting the alert | MVP |
| Change the distance limit | Gives me flexibility to use a different distance | Later |
| Add multiple family members | Lets me use it for more than one person | Later |

**MVP (2–3 features):** *The skateboard: the smallest version I'd actually use.*

- Set a 5-mile distance limit for a family member.
- Receive an alert when they move more than 5 miles away.
- See their current location.

**Later:**

- Add multiple family members.
- Allow different distance limits.
- Add location history.

**Not doing:** *Things I'm deliberately leaving out.*

- Social media features.
- Messaging or chatting.
- Publicly sharing locations.

---

## 5. Tech Stack

### Front end

- **Surface:** Mobile
- **Tools:** React Native / Expo
- **Why:** I would use this mainly on my phone because that is where I would receive the alert and check the location.

### Back end

| Piece | Choice | Why |
|---|---|---|
| Server / API | Node.js | Can handle the location and alert requests |
| Data storage | Firebase | Can store user and location information |
| Outside services (optional) | GPS / Maps service | Needed to calculate distance and show locations |
| Hosting / deploy | Firebase | Easy to connect with the rest of the project |

### Architecture sketch

```mermaid
flowchart LR
  U["Me"] --> FE["Mobile App"]
  FE --> API["Backend / API"]
  API --> DB[("Firebase")]
  API --> GPS["GPS / Maps"]
  API --> A["Distance Alert"]
  A --> U