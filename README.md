# Student Behaviour Monitoring System
### ST. MARTIN'S MATRICULATION SCHOOL - ANDIMADAM

A comprehensive full-stack web application designed for academic conduct logging, daily attendance roll call, disciplinary incident escalation, and parent-teacher communication across 5 roles:
1. **Administrator**
2. **Teacher** (Mary Stella - Class 10-A)
3. **Principal** (Dr. Martin Joseph)
4. **Student** (Rahul Sharma - STM2026001)
5. **Parent** (Ramesh Sharma)

---

### Database Configuration (Connected)

- **Database Engine:** MySQL / MariaDB (XAMPP phpMyAdmin)
- **Host / Port:** `127.0.0.1:3306`
- **Database Name:** `sbms`
- **User:** `root` (Password: empty by default)
- **Status:** **Connected** & Pre-seeded with 15 tables (`students`, `attendance`, `behaviour_incidents`, `users`, `roles`, etc.)

---

### Quick Start Guide (VS Code)

#### 1. Open Terminal in VS Code
Open the project directory in VS Code and press <kbd>Ctrl</kbd> + <kbd>`</kbd> to open the integrated terminal.

#### 2. Ensure MySQL (XAMPP) is Running
Make sure Apache & MySQL are started in the XAMPP Control Panel.

#### 3. Run the Application
Run:
```bash
python app.py
```
*(Or use the local virtual environment Python:)*
```bash
.\.venv\Scripts\python.exe app.py
```

#### 4. Open in Browser
Visit:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)** (or **http://localhost:5000**)

Check live DB status endpoint:
👉 **[http://127.0.0.1:5000/db-status](http://127.0.0.1:5000/db-status)**

---

### User Accounts & Credentials (Login)

| Role | Username | Password | User Name | Responsibilities / Access |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | System Administrator | Full access: User management, RBAC, master settings, security audit logs |
| **Teacher** | `teacher` | `Teacher@123` | Mary Stella | Assigned to Class 10-A: daily roll call attendance, student directory, logging behaviour |
| **Principal** | `principal` | `Principal@123` | Dr. Martin Joseph | High-level school oversight: critical incident escalation, institutional analytics |
| **Student** | `student` | `Student@123` | Rahul Sharma | Personal portal: attendance rate, personal meritorious & disciplinary conduct log |
| **Parent** | `parent` | `Parent@123` | Ramesh Sharma | Guardian portal: child attendance tracking, behaviour notices, incident updates |

---

### Page Routes & Features

- **Dashboard:** `/dashboard` - Live metrics directly from MySQL `sbms`
- **Students Directory:** `/students` - Enrolled student records from `students` table
- **Attendance Register:** `/attendance` - Daily attendance records from `attendance` table
- **Take Daily Roll Call:** `/attendance/mark` - Saves roll call entries directly to MySQL
- **Behaviour Log:** `/behaviour` - Commendations and disciplinary infractions from `behaviour_incidents` table
- **Incident Investigation:** `/behaviour/<id>` - Incident narrative, parent notification, and follow-up timeline
- **Reports & Analytics:** `/reports` - 7 standardized reports with print view
- **User Management:** `/users` - Accounts from `users` table
- **RBAC Matrix:** `/roles` - Permissions mapping across all 5 roles
- **Master Data:** `/masters` - Academic terms, classrooms, categories, severity scale
- **Security Audit Trail:** `/audit` - Real-time audit logs from `audit_logs` table
- **Support Desk:** `/support` - Inquiries stored in `support_tickets` table
- **Notifications:** `/notifications` - Real-time alerts and notices

---

### Campus Media & Facilities Gallery

The portal integrates authentic campus photography for **St. Martin's Matriculation School, Andimadam**:
- **Main Administrative Facade:** (`static/assets/campus_front.jpg`) - Front elevation and administrative office
- **Academic Classroom Wings:** (`static/assets/campus_building.jpg`) - Secondary & higher secondary classrooms
- **Sports & Recreation Grounds:** (`static/assets/campus_playground.jpg`) - Playground and physical education campus grounds

Integrated seamlessly across the **Login Screen** (interactive cycling visual showcase with thumbnail selector) and the **Main Dashboard** (campus facilities showcase gallery).
