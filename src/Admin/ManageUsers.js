import React, { useState, useEffect, useRef } from 'react';
import AdminNavbar from './AdminNavbar';
import Papa from 'papaparse';

const AlumniTrackingPortal = () => {
  const [alumniData, setAlumniData] = useState({
    departments: [],
    years: [],
    alumni: [],
    searchResults: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('departments');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatchYear, setSelectedBatchYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [newAlumni, setNewAlumni] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    batch_year: '',
    address: '',
    dob: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null); 
  
  const departmentOptions = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "Information Technology",
    "Chemical"
  ]; 
  
  const yearOptions = [
    "2015-2019",
    "2016-2020",
    "2017-2021",
    "2018-2022",
    "2019-2023",
    "2020-2024",
    "2021-2025"
  ];
  
  useEffect(() => {
    if (view === 'departments') {
      fetchDepartmentStats();
    } else if (view === 'years' && selectedDepartment) {
      fetchYearStats(selectedDepartment);
    } else if (view === 'students' && selectedDepartment && selectedBatchYear) {
      fetchStudents(selectedDepartment, selectedBatchYear);
    }
  }, [view, selectedDepartment, selectedBatchYear]);
  
  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/Alumni/get_alumni.php');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.departments)) {
        setAlumniData(prev => ({...prev, departments: data.departments}));
        setError(null);
      } else {
        throw new Error('Invalid data format from server');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching department stats:", error);
      setError("Failed to load alumni data. Please try again later.");
      setLoading(false);
    }
  };
  
  const fetchYearStats = async (department) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/Alumni/get_alumni.php?department=${encodeURIComponent(department)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.years)) {
        setAlumniData(prev => ({...prev, years: data.years}));
        setError(null);
      } else {
        throw new Error('Invalid data format from server');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching year stats:", error);
      setError("Failed to load batch year data. Please try again later.");
      setLoading(false);
    }
  };
  
  const fetchStudents = async (department, batchYear) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/Alumni/get_alumni.php?department=${encodeURIComponent(department)}&batch_year=${encodeURIComponent(batchYear)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.alumni)) {
        setAlumniData(prev => ({...prev, alumni: data.alumni}));
        setError(null);
      } else {
        throw new Error('Invalid data format from server');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load student data. Please try again later.");
      setLoading(false);
    }
  };
  
  const globalSearch = async () => {
    if (!searchTerm.trim()) {
      setShowSearchResults(false);
      return;
    }   
    try {
      setLoading(true);
      const response = await fetch(`http://localhost/Alumni/get_alumni.php?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.searchResults)) {
        setAlumniData(prev => ({...prev, searchResults: data.searchResults}));
        setShowSearchResults(true);
        setError(null);
      } else {
        throw new Error('Invalid data format from server');
      }
      setLoading(false);
    } catch (error) {
      console.error("Error searching alumni:", error);
      setError("Failed to search alumni data. Please try again later.");
      setLoading(false);
    }
  };
  
  const searchedStudents = React.useMemo(() => {
    if (!searchTerm || !alumniData.alumni) return alumniData.alumni || [];
    const term = searchTerm.toLowerCase();
    return alumniData.alumni.filter(student => 
      student.name.toLowerCase().includes(term) || 
      student.student_id.toLowerCase().includes(term) || 
      student.email.toLowerCase().includes(term) ||
      student.phone.includes(term)
    );
  }, [alumniData.alumni, searchTerm]);
  
  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setView('years');
  };
  
  const handleYearClick = (batchYear) => {
    setSelectedBatchYear(batchYear);
    setView('students');
  };
  
  const handleBack = () => {
    if (view === 'students') {
      setView('years');
      setSelectedBatchYear(null);
    } else if (view === 'years') {
      setView('departments');
      setSelectedDepartment(null);
    }
    if (showSearchResults) {
      setShowSearchResults(false);
      setSearchTerm('');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this alumni record?")) {
      try {
        const response = await fetch(`http://localhost/Alumni/delete_alumni.php?id=${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status === 'success') {
          if (showSearchResults) {
            setAlumniData(prev => ({
              ...prev, 
              searchResults: prev.searchResults.filter(alum => alum.id !== id)
            }));
          } else {
            setAlumniData(prev => ({
              ...prev, 
              alumni: prev.alumni.filter(alum => alum.id !== id)
            }));
          }
          alert("Alumni record deleted successfully!");
        } else {
          alert("Failed to delete alumni: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting alumni:", error);
        alert("An error occurred while deleting the alumni record.");
      }
    }
  };
  
  const resetSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
  };
  
  const openModal = (mode, alumniData = null) => {
  setModalMode(mode);
  setShowModal(true);    
  if (mode === 'edit' && alumniData) {
    setEditingId(alumniData.id);
    setNewAlumni({
      name: alumniData.name,
      student_id: alumniData.student_id, // Keep for display in edit mode
      email: alumniData.email,
      phone: alumniData.phone,
      department: alumniData.department,
      batch_year: alumniData.batch_year,
      address: alumniData.address || '',
      dob: alumniData.dob || '',
      photo: null 
    });
    setPhotoPreview(alumniData.photo || "/api/placeholder/100/100");
  } else {
    setEditingId(null);
    setNewAlumni({
      name: '',
      email: '',
      phone: '',
      department: '',
      batch_year: '',
      address: '',
      dob: '',
      photo: null
    });
    setPhotoPreview(null);
  }   
  setImportFile(null);
  setImportPreview([]);
  setImportErrors([]);   
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }   
  if (photoInputRef.current) {
    photoInputRef.current.value = '';
  }
};
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlumni(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;    
    setNewAlumni(prev => ({ ...prev, photo: file }));    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmitNewAlumni = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newAlumni).forEach(key => {
      if (key === 'photo' && newAlumni.photo) {
        formData.append('photo', newAlumni.photo);
      } else if (key !== 'photo') {
        formData.append(key, newAlumni[key]);
      }
    });
    try {
      const url = modalMode === 'add' 
        ? 'http://localhost/Alumni/add_alumni.php' 
        : 'http://localhost/Alumni/update_alumni.php';
      if (modalMode === 'edit') {
        formData.append('id', editingId);
      }  
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success || result.status === 'success') {
        if (view === 'departments') {
          await fetchDepartmentStats();
        } else if (view === 'years' && selectedDepartment) {
          await fetchYearStats(selectedDepartment);
        } else if (view === 'students' && selectedDepartment && selectedBatchYear) {
          await fetchStudents(selectedDepartment, selectedBatchYear);
        }
        if (showSearchResults) {
          await globalSearch();
        }
        closeModal();
        alert(modalMode === 'add' ? "Alumni added successfully!" : "Alumni updated successfully!");
      } else {
        alert(`Operation failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error submitting alumni data:", error);
      alert("An error occurred while saving alumni data.");
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;    
    setImportFile(file);    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, errors } = results;
        setImportErrors(errors);
        setImportPreview(data.slice(0, 5));
      },
      error: (error) => {
        console.error('Error parsing file:', error);
        setImportErrors([{ message: 'Failed to parse file. Please check the format.' }]);
      }
    });
  };
  
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    try {
      const formData = new FormData();
      formData.append('csvFile', importFile);
      const response = await fetch('http://localhost/Alumni/import_alumni.php', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        await fetchDepartmentStats();
        closeModal();
        alert(`Successfully imported ${result.count} alumni records.`);
      } else {
        alert(`Import failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error importing alumni data:", error);
      alert("An error occurred while importing alumni data.");
    }
  };
  
  if (loading) {
    return (
      <div className="alumni-management">
        <AdminNavbar />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading alumni data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alumni-management">
        <AdminNavbar />
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error!</h4>
            <p>{error}</p>
            <hr />
            <button className="btn btn-primary" onClick={() => {
              if (view === 'departments') {
                fetchDepartmentStats();
              } else if (view === 'years' && selectedDepartment) {
                fetchYearStats(selectedDepartment);
              } else if (view === 'students' && selectedDepartment && selectedBatchYear) {
                fetchStudents(selectedDepartment, selectedBatchYear);
              }
            }}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="alumni-management">
      <AdminNavbar /> 
      <div className="container mt-4">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Alumni Tracking</h3>
              {(view !== 'departments' || showSearchResults) && (
                <button 
                  className="btn btn-outline-light" 
                  onClick={handleBack}
                >
                  <i className="fas fa-arrow-left me-1"></i> Back
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fas fa-search"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search alumni by name, ID, email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && globalSearch()}
                  />
                  {searchTerm && (
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={resetSearch}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                  <button 
                    className="btn btn-primary" 
                    type="button"
                    onClick={globalSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-md-end mt-3 mt-md-0">
                <button className="btn btn-success me-2" onClick={() => openModal('add')}>
                  <i className="fas fa-user-plus me-1"></i> Add Alumni
                </button>
                <button className="btn btn-info text-white" onClick={() => openModal('import')}>
                  <i className="fas fa-file-import me-1"></i> Import CSV
                </button>
              </div>
            </div>
            {!showSearchResults && (
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="#" onClick={() => setView('departments')}>Departments</a>
                  </li>
                  {selectedDepartment && (
                    <li className={`breadcrumb-item ${view === 'years' ? 'active' : ''}`}>
                      {view === 'students' ? (
                        <a href="#" onClick={() => {
                          setView('years');
                          setSelectedBatchYear(null);
                        }}>{selectedDepartment}</a>
                      ) : selectedDepartment}
                    </li>
                  )}
                  {selectedBatchYear && view === 'students' && (
                    <li className="breadcrumb-item active">Batch {selectedBatchYear}</li>
                  )}
                </ol>
              </nav>
            )}
            {showSearchResults && (
              <>
                <h4 className="mb-3">Search Results</h4>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Photo</th>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Batch</th>
                        <th>DOB</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumniData.searchResults && alumniData.searchResults.length > 0 ? (
                        alumniData.searchResults.map(student => (
                          <tr key={student.id}>
                            <td className="text-center">
                              <img 
                                src={student.photo || "/api/placeholder/100/100"} 
                                alt={student.name} 
                                className="rounded-circle" 
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                              />
                            </td>
                            <td>{student.student_id}</td>
                            <td>{student.name}</td>
                            <td>{student.department}</td>
                            <td>{student.batch_year}</td>
                            <td>{student.dob}</td>
                            <td>{student.email}</td>
                            <td>{student.phone}</td>
                            <td className="text-center">
                              <button 
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => openModal('edit', student)}
                              >
                                <i className="fas fa-edit me-1"></i> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(student.id)}
                              >
                                <i className="fas fa-trash-alt me-1"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-3">
                            No alumni records found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="card bg-light mt-3">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        Showing <strong>{alumniData.searchResults ? alumniData.searchResults.length : 0}</strong> alumni records matching "<strong>{searchTerm}</strong>"
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
            {!showSearchResults && view === 'departments' && (
              <>
                <h4 className="mb-3">Departments Overview</h4>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  {alumniData.departments && alumniData.departments.map(({ department, count }) => (
                    <div key={department} className="col">
                      <div 
                        className="card h-100 border-primary cursor-pointer"
                        onClick={() => handleDepartmentClick(department)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body text-center">
                          <h5 className="card-title">{department}</h5>
                          <div className="mt-3">
                            <span className="display-4 fw-bold">{count}</span>
                            <p className="text-muted mb-0">Alumni Records</p>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-top-0 text-center">
                          <button className="btn btn-sm btn-primary">
                            View Details <i className="fas fa-chevron-right ms-1"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!showSearchResults && view === 'years' && selectedDepartment && (
                <>
                  <h4 className="mb-3">{selectedDepartment} Department - Batches</h4>
                  <div className="row row-cols-1 row-cols-md-4 g-4">
                    {alumniData.years && alumniData.years.map(({ batch_year, count }) => (
                      <div key={batch_year} className="col">
                        <div 
                          className="card h-100 border-info cursor-pointer"
                          onClick={() => handleYearClick(batch_year)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="card-body text-center">
                            <h5 className="card-title">Batch {batch_year}</h5>
                            <div className="mt-3">
                              <span className="display-4 fw-bold">{count}</span>
                              <p className="text-muted mb-0">Alumni</p>
                            </div>
                          </div>
                          <div className="card-footer bg-transparent border-top-0 text-center">
                            <button className="btn btn-sm btn-info text-white">
                              View Students <i className="fas fa-chevron-right ms-1"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            {!showSearchResults && view === 'students' && selectedDepartment && selectedBatchYear && (
              <>
                <h4 className="mb-3">
                  {selectedDepartment} Department - Batch {selectedBatchYear} Alumni
                </h4>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="fas fa-search"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search in current batch..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={resetSearch}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Photo</th>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>DOB</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchedStudents && searchedStudents.length > 0 ? (
                        searchedStudents.map(student => (
                          <tr key={student.id}>
                            <td className="text-center">
                              <img 
                                src={student.photo || "/api/placeholder/100/100"} 
                                alt={student.name} 
                                className="rounded-circle" 
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                              />
                            </td>
                            <td>{student.student_id}</td>
                            <td>{student.name}</td>
                            <td>{student.dob}</td>
                            <td>{student.email}</td>
                            <td>{student.phone}</td>
                            <td>{student.address}</td>
                            <td className="text-center">
                              <button 
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => openModal('edit', student)}
                              >
                                <i className="fas fa-edit me-1"></i> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(student.id)}
                              >
                                <i className="fas fa-trash-alt me-1"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-3">
                            No alumni records found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="card bg-light mt-3">
                  <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        Showing <strong>{searchedStudents ? searchedStudents.length : 0}</strong> out of <strong>{alumniData.alumni ? alumniData.alumni.length : 0}</strong> alumni
                      </span>
                      <span className="text-muted">
                        {selectedDepartment} Department | Batch {selectedBatchYear}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'add' 
                    ? 'Add New Alumni' 
                    : modalMode === 'edit' 
                    ? 'Edit Alumni' 
                    : 'Import Alumni Records'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>             
              <div className="modal-body">
                {(modalMode === 'add' || modalMode === 'edit') && (
  <form onSubmit={handleSubmitNewAlumni}>
    <div className="row mb-4">
      <div className="col-md-3">
        <div className="text-center">
          <div className="mb-3">
            <img 
              src={photoPreview || "/api/placeholder/100/100"} 
              alt="Student Photo" 
              className="img-thumbnail rounded-circle"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          </div>
          <div className="mb-3">
            <label className="btn btn-outline-primary btn-sm">
              <i className="fas fa-camera me-1"></i> Upload Photo
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
                ref={photoInputRef}
              />
            </label>
          </div>
          <small className="text-muted d-block">
            Recommended: 300x300 pixels
          </small>
        </div>
      </div>
      <div className="col-md-9">
        <div className="row g-3">
          {modalMode === 'edit' && (
            <div className="col-md-6">
              <label className="form-label">Student ID</label>
              <input 
                type="text" 
                className="form-control" 
                name="student_id"
                value={newAlumni.student_id || ''}
                disabled
              />
              <small className="text-muted">Auto-generated - cannot be edited</small>
            </div>
          )}                       
          <div className="col-md-6">
            <label className="form-label">Full Name*</label>
            <input 
              type="text" 
              className="form-control" 
              name="name"
              value={newAlumni.name}
              onChange={handleInputChange}
              required
            />
          </div>                         
          <div className="col-md-6">
            <label className="form-label">Email*</label>
            <input 
              type="email" 
              className="form-control" 
              name="email"
              value={newAlumni.email}
              onChange={handleInputChange}
              required
            />
          </div>                          
          <div className="col-md-6">
            <label className="form-label">Phone Number*</label>
            <input 
              type="text" 
              className="form-control" 
              name="phone"
              value={newAlumni.phone}
              onChange={handleInputChange}
              required
            />
          </div>                         
          <div className="col-md-6">
            <label className="form-label">Department*</label>
            <select 
              className="form-select"
              name="department"
              value={newAlumni.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>                         
          <div className="col-md-6">
            <label className="form-label">Batch Year*</label>
            <select 
              className="form-select"
              name="batch_year"
              value={newAlumni.batch_year}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Batch</option>
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Date of Birth*</label>
            <input 
              type="date" 
              className="form-control" 
              name="dob"
              value={newAlumni.dob}
              onChange={handleInputChange}
              required
            />
          </div>                        
          <div className="col-12">
            <label className="form-label">Address</label>
            <textarea 
              className="form-control" 
              rows="2"
              name="address"
              value={newAlumni.address}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
      </div>
    </div> 
    <div className="mt-4 text-end">
      <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>Cancel</button>
      <button type="submit" className="btn btn-primary">Save Alumni</button>
    </div>
  </form>
)}
                {modalMode === 'import' && (
                  <form onSubmit={handleImportSubmit}>
                    <div className="mb-4">
                      <label className="form-label">Upload CSV File</label>
                      <div className="input-group">
                        <input 
                          type="file" 
                          className="form-control" 
                          accept=".csv"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          required
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => {
                          setImportFile(null);
                          setImportPreview([]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}>
                          Clear
                        </button>
                      </div>
                      <small className="text-muted d-block mt-1">
                        File should contain columns: studentId, name, email, phone, department, batch_year, address
                      </small>
                    </div>
                    {importErrors.length > 0 && (
                      <div className="alert alert-danger">
                        <h6 className="alert-heading">Import Errors:</h6>
                        <ul className="mb-0">
                          {importErrors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {importPreview.length > 0 && (
                      <div className="mb-4">
                        <h6>Preview (First 5 records):</h6>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered">
                            <thead className="table-light">
                              <tr>
                                {Object.keys(importPreview[0]).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row).map((value, idx) => (
                                    <td key={idx}>{value}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="text-muted small">
                          Showing {importPreview.length} of {importFile ? 'many' : '0'} records
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-end">
                      <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>Cancel</button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={!importFile || importErrors.length > 0}
                      >
                        Import Records
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AlumniTrackingPortal;