document.getElementById("brand-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const action = e.target.action;
  const method = e.target.method;

  const formMethod = e.target.querySelector('input[name="_method"]') ? 'PUT' : method;

  const response = await fetch(action, {
    method: formMethod,
    body: formData,
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.msg);
    window.location.href = result.redirectTo; 
  } else {
    alert(result.error || "Error processing request");
  }
});

async function deleteBrand(brandId) {
  if (confirm("Are you sure you want to delete this brand?")) {
    const response = await fetch(`/api/brand/delete/${brandId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.msg);
      window.location.reload(); 
    } else {
      alert(result.error || "Error deleting brand");
    }
  }
}