import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

//database connection
const supabaseUrl = 'https://psqnilzrlkoliahhwnho.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcW5pbHpybGtvbGlhaGh3bmhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzkzNDEsImV4cCI6MjA3MTg1NTM0MX0.frfoimrng1DP-07XbfmoLxhNC4e88euYCAzrODasXgk';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase module loaded');

// Fetch all students
async function fetchStudents() {
    try {
        const { data, error } = await supabase.from('students').select('*').order('id', { ascending: true });
        if (error) {
            console.error('Error fetching students:', error.message, error.code, error.details);
            return [];
        }
        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching students:', error);
        return [];
    }
}

// Add a new student
async function addStudent(name, age, school, college, course) {
    if (!name || !age || !college || !course) {
        console.error('Validation failed: Missing required fields', { name, age, college, course });
        return false;
    }
    if (isNaN(age) || age < 1 || age > 100) {
        console.error('Validation failed: Invalid age', { age });
        return false;
    }

    const studentData = {
        name: name.trim(),
        age: parseInt(age),
        school: school ? school.trim() : null,
        college: college.trim(),
        course: course.trim(),
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('students')
            .insert([studentData])
            .select();

        if (error) {
            console.error('Error adding student:', error.message, error.code, error.details, { studentData });
            return false;
        }
        console.log('Student added successfully:', data);
        return true;
    } catch (error) {
        console.error('Unexpected error adding student:', error);
        return false;
    }
}

// Update a student - FIXED VERSION
async function updateStudent(id, name, age, school, college, course) {
    console.log('Attempting to update student with ID:', id, 'Data:', { name, age, school, college, course });
    
    // Validation
    if (!id || isNaN(id)) {
        console.error('Validation failed: Invalid ID', { id });
        throw new Error('Invalid student ID');
    }
    if (!name || !age || !college || !course) {
        console.error('Validation failed: Missing required fields', { name, age, college, course });
        throw new Error('Missing required fields');
    }
    if (isNaN(age) || age < 1 || age > 100) {
        console.error('Validation failed: Invalid age', { age });
        throw new Error('Invalid age');
    }

    const studentData = {
        name: name.trim(),
        age: parseInt(age),
        school: school ? school.trim() : null,
        college: college.trim(),
        course: course.trim()
    };

    try {
        // First, verify the student exists
        const { data: existingStudent, error: fetchError } = await supabase
            .from('students')
            .select('id, name')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('Error checking if student exists:', fetchError);
            if (fetchError.code === 'PGRST116') {
                throw new Error('Student not found');
            }
            throw new Error(`Database error: ${fetchError.message}`);
        }

        if (!existingStudent) {
            console.error('Student not found with ID:', id);
            throw new Error('Student not found');
        }

        console.log('Student exists, proceeding with update:', existingStudent);

        // Perform the update with a longer timeout
        const { data, error } = await supabase
            .from('students')
            .update(studentData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error from Supabase update:', error.message, error.code, error.details, { id, studentData });
            throw new Error(`Update failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
            console.error('Update returned no data. This might be an RLS policy issue.', { id, studentData });
            // Try to fetch the student again to see if it was actually updated
            const { data: updatedStudent, error: verifyError } = await supabase
                .from('students')
                .select('*')
                .eq('id', id)
                .single();
            
            if (verifyError) {
                throw new Error('Update verification failed');
            }
            
            // Check if the data actually changed
            const isUpdated = updatedStudent.name === studentData.name && 
                             updatedStudent.age === studentData.age &&
                             updatedStudent.college === studentData.college &&
                             updatedStudent.course === studentData.course &&
                             (updatedStudent.school === studentData.school || 
                              (!updatedStudent.school && !studentData.school));
            
            if (isUpdated) {
                console.log('Update was successful (verified by re-fetch):', updatedStudent);
                return true;
            } else {
                throw new Error('Update verification failed - data was not changed');
            }
        }

        console.log('Student updated successfully:', data);
        return true;

    } catch (error) {
        console.error('Caught update error:', error.message, { id, studentData });
        throw error;
    }
}

// Delete a student
async function deleteStudent(id) {
    if (!id || isNaN(id)) {
        console.error('Validation failed: Invalid ID', { id });
        return false;
    }
    
    try {
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) {
            console.error('Error deleting student:', error.message, error.code, error.details, { id });
            return false;
        }
        console.log('Student deleted successfully:', { id });
        return true;
    } catch (error) {
        console.error('Unexpected error deleting student:', error);
        return false;
    }
}

// Load and display students
async function loadStudents() {
    const studentList = document.getElementById('studentList');
    const statusMessage = document.getElementById('statusMessage');
    if (!studentList || !statusMessage) {
        console.error('DOM elements not found:', { studentList, statusMessage });
        return;
    }

    statusMessage.textContent = 'Fetching data from database...';
    statusMessage.style.display = 'block';
    
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        statusMessage.textContent = 'On the way to backend...';
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const students = await fetchStudents();
        
        statusMessage.textContent = 'On the way to frontend...';
        await new Promise(resolve => setTimeout(resolve, 300));

        studentList.innerHTML = '';
        if (students.length === 0) {
            statusMessage.textContent = 'No students found.';
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="text-center">No students available.</td>';
            studentList.appendChild(tr);
        } else {
            statusMessage.textContent = `Loaded ${students.length} student(s) successfully!`;
            students.forEach((student, index) => {
                const tr = document.createElement('tr');
                tr.style.animationDelay = `${0.1 * index}s`;
                tr.innerHTML = `
                    <td>${escapeHtml(student.name || 'N/A')}</td>
                    <td>${student.age || 'N/A'}</td>
                    <td>${escapeHtml(student.school || 'N/A')}</td>
                    <td>${escapeHtml(student.college || 'N/A')}</td>
                    <td>${escapeHtml(student.course || 'N/A')}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-2 edit-btn" 
                                data-id="${student.id}" 
                                data-name="${escapeHtml(student.name || '')}" 
                                data-age="${student.age || ''}" 
                                data-school="${escapeHtml(student.school || '')}" 
                                data-college="${escapeHtml(student.college || '')}" 
                                data-course="${escapeHtml(student.course || '')}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" 
                                data-id="${student.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                studentList.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        statusMessage.textContent = 'Error loading students. Check console for details.';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Export functions for ES module usage
export { addStudent, updateStudent, deleteStudent, loadStudents, fetchStudents };

