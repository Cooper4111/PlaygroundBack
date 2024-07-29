document.getElementById('uploadForm').addEventListener('submit', async function(event){
    event.preventDefault();
    
    const formData = new FormData();
    const avatar = document.getElementById('avatar').files[0];
    formData.append('avatar', avatar);
  
    try {
        const response = await fetch('http://localhost:4000/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const data = await response.json();
        
        document.getElementById('message').textContent = data.message;
    } catch (error) {
        document.getElementById('message').textContent = 'Error uploading file';
    }
});
  