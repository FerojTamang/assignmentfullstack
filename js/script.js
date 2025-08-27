import { addStudent, updateStudent, deleteStudent, loadStudents } from './supabase.js';

console.log('Script module loaded');

// Verify module imports
if (typeof addStudent === 'undefined' || typeof updateStudent === 'undefined') {
    console.error('Module import failed: addStudent or updateStudent not defined. Check supabase.js exports.');
} else {
    console.log('Module imports verified: addStudent and updateStudent are available.');
}

// Handle Enter key navigation for add form
const inputs = ['name', 'age', 'school', 'college', 'course'];
inputs.forEach((id, index) => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < inputs.length - 1) {
                    document.getElementById(inputs[index + 1]).focus();
                } else {
                    document.getElementById('submitButton').focus();
                }
            }
        });
    }
});

// Handle Enter key navigation for edit form
const editInputs = ['editName', 'editAge', 'editSchool', 'editCollege', 'editCourse'];
editInputs.forEach((id, index) => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < editInputs.length - 1) {
                    document.getElementById(editInputs[index + 1]).focus();
                } else {
                    document.getElementById('saveEditButton').focus();
                }
            }
        });
    }
});

// Add student form
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = document.getElementById('submitButton');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const collegeInput = document.getElementById('college');
    const courseInput = document.getElementById('course');
    const schoolInput = document.getElementById('school');

    const name = nameInput.value.trim();
    const age = parseInt(ageInput.value);
    const school = schoolInput.value.trim() || null;
    const college = collegeInput.value.trim();
    const course = courseInput.value.trim();

    // Client-side validation
    if (!name || !college || !course) {
        alert('Please fill all required fields correctly.');
        return;
    }
    if (isNaN(age) || age < 1 || age > 100) {
        alert('Please enter a valid age (1-100).');
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        console.log('Attempting to add student:', { name, age, school, college, course });
        const success = await addStudent(name, age, school, college, course);
        
        if (success) {
            document.getElementById('studentForm').reset();
            alert('Student added successfully!');
            await loadStudents();
        } else {
            alert('Failed to add student. Check console for details.');
        }
    } catch (error) {
        alert('Error adding student: ' + error.message);
        console.error('Add student error:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Student';
    }
});

// Show students - SINGLE EVENT LISTENER
document.getElementById('showStudents').addEventListener('click', async () => {
    console.log('Show students button clicked');
    await loadStudents();
});

// Fallback function to force show modal
function showModalFallback(modalElement) {
    console.log('Using fallback method to show modal');
    
    // Remove any existing backdrop
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }
    
    // Force show modal
    modalElement.style.display = 'block';
    modalElement.style.zIndex = '10000';
    modalElement.classList.add('show');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
    modalElement.removeAttribute('aria-hidden');
    
    // Create and add backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '9999';
    backdrop.id = 'manual-backdrop';
    document.body.appendChild(backdrop);
    document.body.classList.add('modal-open');
    
    console.log('Fallback modal should now be visible');
    
    // Add click handlers for backdrop and close button
    backdrop.addEventListener('click', () => closeModalFallback(modalElement));
    
    const closeBtn = modalElement.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModalFallback(modalElement));
    }
    
    const cancelBtn = modalElement.querySelector('[data-bs-dismiss="modal"]');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModalFallback(modalElement));
    }
}

// Fallback function to close modal
function closeModalFallback(modalElement) {
    console.log('Closing modal with fallback method');
    
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
    
    const backdrop = document.getElementById('manual-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
    
    document.body.classList.remove('modal-open');
    
    // Reset form
    document.getElementById('editStudentForm').reset();
}

// Edit/Delete buttons - ENHANCED WITH FALLBACK
document.getElementById('studentList').addEventListener('click', async (e) => {
    // Handle Edit button
    const editTarget = e.target.closest('.edit-btn');
    if (editTarget) {
        console.log('Edit button clicked for ID:', editTarget.dataset.id);
        const id = parseInt(editTarget.dataset.id);
        const name = editTarget.dataset.name || '';
        const age = parseInt(editTarget.dataset.age) || '';
        const school = editTarget.dataset.school || '';
        const college = editTarget.dataset.college || '';
        const course = editTarget.dataset.course || '';

        if (!id || isNaN(id)) {
            alert('Invalid student ID. Cannot open edit modal.');
            return;
        }

        // Populate the modal fields
        document.getElementById('editId').value = id;
        document.getElementById('editName').value = name;
        document.getElementById('editAge').value = age;
        document.getElementById('editSchool').value = school;
        document.getElementById('editCollege').value = college;
        document.getElementById('editCourse').value = course;

        // Reset button state
        const saveButton = document.getElementById('saveEditButton');
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';

        // ENHANCED MODAL SHOWING with multiple fallback methods
        const modalElement = document.getElementById('editStudentModal');
        
        console.log('Attempting to show modal...');
        
        try {
            // Method 1: Standard Bootstrap modal
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            modal.show();
            console.log('Bootstrap modal.show() called');
            
            // Verify modal is actually visible after a brief delay
            setTimeout(() => {
                const isVisible = modalElement.classList.contains('show') && 
                                modalElement.style.display !== 'none';
                console.log('Modal visible check:', isVisible);
                
                if (!isVisible) {
                    console.log('Bootstrap modal failed, trying fallback method...');
                    showModalFallback(modalElement);
                }
            }, 300);
            
        } catch (error) {
            console.error('Bootstrap modal error:', error);
            showModalFallback(modalElement);
        }
        
        return;
    }

    // Handle Delete button
    const deleteTarget = e.target.closest('.delete-btn');
    if (deleteTarget) {
        console.log('Delete button clicked for ID:', deleteTarget.dataset.id);
        const id = parseInt(deleteTarget.dataset.id);
        
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                const success = await deleteStudent(id);
                if (success) {
                    alert('Student deleted successfully!');
                    await loadStudents();
                } else {
                    alert('Failed to delete student. Check console for details.');
                }
            } catch (error) {
                alert('Error deleting student: ' + error.message);
                console.error('Delete student error:', error);
            }
        }
    }
});

// Save edit - ENHANCED WITH FALLBACK MODAL CLOSING
document.getElementById('saveEditButton').addEventListener('click', async () => {
    console.log('Save button clicked');
    
    const id = parseInt(document.getElementById('editId').value);
    const name = document.getElementById('editName').value.trim();
    const age = parseInt(document.getElementById('editAge').value);
    const school = document.getElementById('editSchool').value.trim() || null;
    const college = document.getElementById('editCollege').value.trim();
    const course = document.getElementById('editCourse').value.trim();
    const saveButton = document.getElementById('saveEditButton');
    const modalElement = document.getElementById('editStudentModal');

    // Client-side validation
    if (!id || isNaN(id)) {
        console.error('Invalid ID:', id);
        alert('Invalid student ID. Cannot update student.');
        return;
    }
    if (!name || !college || !course) {
        console.error('Missing fields:', { name, college, course });
        alert('Please fill all required fields correctly.');
        return;
    }
    if (isNaN(age) || age < 1 || age > 100) {
        console.error('Invalid age:', age);
        alert('Please enter a valid age (1-100).');
        return;
    }

    // Disable button and show loading state
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        console.log('Calling updateStudent with ID:', id, 'Data:', { name, age, school, college, course });
        
        const success = await updateStudent(id, name, age, school, college, course);
        
        if (success) {
            // Close modal with fallback
            try {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: create new instance and hide
                    const newModal = new bootstrap.Modal(modalElement);
                    newModal.hide();
                }
            } catch (modalError) {
                console.error('Error closing modal with Bootstrap, using fallback:', modalError);
                closeModalFallback(modalElement);
            }
            
            document.getElementById('editStudentForm').reset();
            alert('Student updated successfully!');
            await loadStudents();
        } else {
            console.error('Update failed silently for ID:', id);
            alert('Failed to update student. Check console for details.');
        }
    } catch (error) {
        console.error('Update student error for ID:', id, error);
        alert('Error updating student: ' + error.message);
    } finally {
        // Always restore button state
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
});

// Handle modal events to reset state
document.getElementById('editStudentModal').addEventListener('hidden.bs.modal', function () {
    // Reset button state when modal is closed
    const saveButton = document.getElementById('saveEditButton');
    saveButton.disabled = false;
    saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    
    // Reset form
    document.getElementById('editStudentForm').reset();
});

// Load students on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded, loading students...');
    await loadStudents();
});

// Export loadStudents for potential external use
export { loadStudents };