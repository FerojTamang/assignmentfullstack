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
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Please fill all required fields correctly.';
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
        return;
    }
    if (isNaN(age) || age < 1 || age > 100) {
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Please enter a valid age (1-100).';
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        console.log('Attempting to add student:', { name, age, school, college, course });
        const success = await addStudent(name, age, school, college, course);
        
        if (success) {
            document.getElementById('studentForm').reset();
            const notification = document.getElementById('customNotification');
            const notificationMessage = document.getElementById('notificationMessage');
            notificationMessage.textContent = 'Student added successfully!';
            notification.classList.remove('d-none');
            setTimeout(() => {
                notification.classList.add('d-none');
            }, 3000);
            await loadStudents();
        } else {
            const notification = document.getElementById('customNotification');
            const notificationMessage = document.getElementById('notificationMessage');
            notificationMessage.textContent = 'Failed to add student. Check console for details.';
            notification.classList.remove('d-none');
            notification.classList.remove('alert-success');
            notification.classList.add('alert-danger');
            setTimeout(() => {
                notification.classList.add('d-none');
                notification.classList.remove('alert-danger');
                notification.classList.add('alert-success');
            }, 3000);
        }
    } catch (error) {
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Error adding student: ' + error.message;
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
        console.error('Add student error:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Student';
    }
});

// Show students
document.getElementById('showStudents').addEventListener('click', async () => {
    console.log('Show students button clicked');
    await loadStudents();
});

// Fallback function to show modal
function showModalFallback(modalElement) {
    console.log('Using fallback method to show modal');
    
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    
    modalElement.style.display = 'block';
    modalElement.classList.add('show');
    modalElement.setAttribute('aria-modal', 'true');
    modalElement.setAttribute('role', 'dialog');
    modalElement.removeAttribute('aria-hidden');
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.zIndex = '1040';
    document.body.appendChild(backdrop);
    
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
}

// Fallback function to close modal
function closeModalFallback(modalElement) {
    console.log('Closing modal with fallback method');
    
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    modalElement.removeAttribute('role');
    
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
    
    document.getElementById('editStudentForm').reset();
}

// Edit/Delete buttons
document.getElementById('studentList').addEventListener('click', async (e) => {
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
            const notification = document.getElementById('customNotification');
            const notificationMessage = document.getElementById('notificationMessage');
            notificationMessage.textContent = 'Invalid student ID. Cannot open edit modal.';
            notification.classList.remove('d-none');
            notification.classList.remove('alert-success');
            notification.classList.add('alert-danger');
            setTimeout(() => {
                notification.classList.add('d-none');
                notification.classList.remove('alert-danger');
                notification.classList.add('alert-success');
            }, 3000);
            return;
        }

        document.getElementById('editId').value = id;
        document.getElementById('editName').value = name;
        document.getElementById('editAge').value = age;
        document.getElementById('editSchool').value = school;
        document.getElementById('editCollege').value = college;
        document.getElementById('editCourse').value = course;

        const saveButton = document.getElementById('saveEditButton');
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';

        const modalElement = document.getElementById('editStudentModal');
        
        console.log('Attempting to show modal...');
        
        try {
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
            modal.show();
            console.log('Bootstrap modal.show() called');
            
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

    const deleteTarget = e.target.closest('.delete-btn');
    if (deleteTarget) {
        console.log('Delete button clicked for ID:', deleteTarget.dataset.id);
        const id = parseInt(deleteTarget.dataset.id);
        
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                const success = await deleteStudent(id);
                if (success) {
                    const notification = document.getElementById('customNotification');
                    const notificationMessage = document.getElementById('notificationMessage');
                    notificationMessage.textContent = 'Student deleted successfully!';
                    notification.classList.remove('d-none');
                    setTimeout(() => {
                        notification.classList.add('d-none');
                    }, 3000);
                    await loadStudents();
                } else {
                    const notification = document.getElementById('customNotification');
                    const notificationMessage = document.getElementById('notificationMessage');
                    notificationMessage.textContent = 'Failed to delete student. Check console for details.';
                    notification.classList.remove('d-none');
                    notification.classList.remove('alert-success');
                    notification.classList.add('alert-danger');
                    setTimeout(() => {
                        notification.classList.add('d-none');
                        notification.classList.remove('alert-danger');
                        notification.classList.add('alert-success');
                    }, 3000);
                }
            } catch (error) {
                const notification = document.getElementById('customNotification');
                const notificationMessage = document.getElementById('notificationMessage');
                notificationMessage.textContent = 'Error deleting student: ' + error.message;
                notification.classList.remove('d-none');
                notification.classList.remove('alert-success');
                notification.classList.add('alert-danger');
                setTimeout(() => {
                    notification.classList.add('d-none');
                    notification.classList.remove('alert-danger');
                    notification.classList.add('alert-success');
                }, 3000);
                console.error('Delete student error:', error);
            }
        }
    }
});

// Save edit
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
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Invalid student ID. Cannot update student.';
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
        return;
    }
    if (!name || !college || !course) {
        console.error('Missing fields:', { name, college, course });
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Please fill all required fields correctly.';
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
        return;
    }
    if (isNaN(age) || age < 1 || age > 100) {
        console.error('Invalid age:', age);
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Please enter a valid age (1-100).';
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
        return;
    }

    // Disable button and show loading state
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    let success = false;
    try {
        console.log('Calling updateStudent with ID:', id, 'Data:', { name, age, school, college, course });
        
        success = await updateStudent(id, name, age, school, college, course);
        
        if (success) {
            // Close modal with enhanced reliability
            try {
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.hide();
                
                // Wait for modal hide animation to complete
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Force cleanup
                modalElement.style.display = 'none';
                modalElement.classList.remove('show');
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
                modalElement.removeAttribute('role');

                document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '';

                console.log('Modal closed and cleaned up successfully');
            } catch (modalError) {
                console.error('Error closing modal with Bootstrap:', modalError);
                closeModalFallback(modalElement);
            }

            // Reset form
            document.getElementById('editStudentForm').reset();
        } else {
            console.error('Update failed silently for ID:', id);
            const notification = document.getElementById('customNotification');
            const notificationMessage = document.getElementById('notificationMessage');
            notificationMessage.textContent = 'Failed to update student. Check console for details.';
            notification.classList.remove('d-none');
            notification.classList.remove('alert-success');
            notification.classList.add('alert-danger');
            setTimeout(() => {
                notification.classList.add('d-none');
                notification.classList.remove('alert-danger');
                notification.classList.add('alert-success');
            }, 3000);
        }
    } catch (error) {
        console.error('Update student error for ID:', id, error);
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Error updating student: ' + error.message;
        notification.classList.remove('d-none');
        notification.classList.remove('alert-success');
        notification.classList.add('alert-danger');
        setTimeout(() => {
            notification.classList.add('d-none');
            notification.classList.remove('alert-danger');
            notification.classList.add('alert-success');
        }, 3000);
    } finally {
        // Restore button state
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }

    // Show success message and reload students
    if (success) {
        const notification = document.getElementById('customNotification');
        const notificationMessage = document.getElementById('notificationMessage');
        notificationMessage.textContent = 'Student updated successfully!';
        notification.classList.remove('d-none');
        setTimeout(() => {
            notification.classList.add('d-none');
        }, 3000);
        
        await loadStudents();
        
        // Force UI refresh
        const tableContainer = document.querySelector('.table-container');
        tableContainer.style.display = 'none';
        void tableContainer.offsetHeight;
        tableContainer.style.display = 'block';
        document.body.style.pointerEvents = 'auto';
    }
});

// Handle modal events to reset state
document.getElementById('editStudentModal').addEventListener('hidden.bs.modal', function () {
    const saveButton = document.getElementById('saveEditButton');
    saveButton.disabled = false;
    saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    
    document.getElementById('editStudentForm').reset();
});

// Load students on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded, loading students...');
    await loadStudents();
});

// Debug UI interactivity
document.addEventListener('click', (e) => {
    console.log('Document clicked at:', e.target);
});

// Export loadStudents for potential external use
export { loadStudents };