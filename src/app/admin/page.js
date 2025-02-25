"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser, faBlog } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { RotatingLines } from "react-loader-spinner";

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [eventLocation, setEventLocation] = useState('');
    const [image, setImage] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);

    const [name, setName] = useState('');
    const [titleProfile, setTitleProfile] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [website, setWebsite] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Blog-related state variables
    const [blogs, setBlogs] = useState([]);
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [blogTitle, setBlogTitle] = useState('');
    const [blogContent, setBlogContent] = useState('');
    const [blogImage, setBlogImage] = useState(null);
    const [editingBlog, setEditingBlog] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/auth/verify');
          if (!response.ok) throw new Error('Not authenticated');
        } catch (error) {
          router.push('/login');
        }
      };
      const fetchBlogs = async () => {
        try {
          const response = await fetch('/api/blog');
          const data = await response.json();
          setBlogs(data.blogs);
        } catch (error) {
          console.error('Error fetching blogs:', error);
        }
      };
      checkAuth();
      fetchEvents();
      fetchBlogs();
    }, [router]);
    

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    const handleTabClick = (tab) => setActiveTab(tab);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    };

    const handleProfileUpdate = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
  
      // Build updatedProfile object with only non-empty fields
      const updatedProfile = {};
      if (name) updatedProfile.name = name;
      if (titleProfile) updatedProfile.title = titleProfile;
      if (linkedin) updatedProfile.linkedin = linkedin;
      if (github) updatedProfile.github = github;
      if (website) updatedProfile.website = website;
      if (profileImage) updatedProfile.image = profileImage;
  
      try {
          const response = await fetch('/api/admin/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedProfile),
          });
  
          if (!response.ok) throw new Error('Failed to update profile');
          setSuccess('Profile updated successfully!');
      } catch (error) {
          setError(error.message || 'An error occurred while updating profile.');
      } finally {
        setLoading(false);
    }
};

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      const newEvent = { title, description, startDate, endDate, allDay, eventLocation, image };
    
      try {
        const method = editingEvent ? 'PUT' : 'POST';
        const url = editingEvent ? `/api/events/${editingEvent._id}` : '/api/events';
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent),
        });
    
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to save event');
        }

        setSuccess(editingEvent ? 'Event updated successfully!' : 'Event added successfully!');
        resetForm();
        fetchEvents();
    } catch (error) {
        setError(error.message || 'An error occurred while saving the event.');
    } finally {
        setLoading(false);
    }
};

    const resetForm = () => {
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setAllDay(false);
      setEventLocation('');
      setImage(null);
      setEditingEvent(null);
    };

    const handleSelectEvent = (id) => {
      setSelectedEvents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDeleteSelected = async () => {
      if (selectedEvents.length === 0) {
        setError('No events selected for deletion');
        return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

      try {
        const response = await fetch('/api/events', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedEvents }),
        });
    
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to delete events');
        }

        setSuccess('Selected events deleted successfully!');
        setSelectedEvents([]);
        fetchEvents();
    } catch (error) {
        setError(error.message || 'An error occurred while deleting events.');
    } finally {
        setLoading(false);
    }
};

    const handleEditEvent = (event) => {
      setTitle(event.title);
      setDescription(event.description);
      setStartDate(event.startDate);
      setEndDate(event.endDate);
      setAllDay(event.allDay);
      setEventLocation(event.eventLocation);
      setImage(event.image);
      setEditingEvent(event);
    };
        const handleLogout = async () => {
      await fetch('/api/auth/logout', { method: 'GET' });
      router.push('/login');
    };

    const handleRegister = async () => {
      router.push('/register');
    };

    const handleChangePassword = async (e) => {
      e.preventDefault();
      if (!newPassword) {
        setError('Please enter a new password.');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
  
      try {
        const response = await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword }),
        });
  
        const result = await response.json();
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to update password');
      }

      setSuccess('Password updated successfully!');
      setShowChangePasswordModal(false);
  } catch (error) {
      setError(error.message || 'An error occurred while changing the password.');
  } finally {
      setLoading(false);
  }
};

    const handleSubmitBlog = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
      const newBlog = { title: blogTitle, content: blogContent, image: blogImage };
  
      try {
        const method = editingBlog ? "PUT" : "POST";
        const url = editingBlog ? `/api/blog/${editingBlog._id}` : "/api/blog";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBlog),
        });
  
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to save blog');
      }

      setSuccess(editingBlog ? 'Blog updated successfully!' : 'Blog added successfully!');
      resetBlogForm();
      const fetchResponse = await fetch('/api/blog');
      const data = await fetchResponse.json();
      setBlogs(data.blogs);
  } catch (error) {
      setError(error.message || 'An error occurred while saving the blog.');
  } finally {
      setLoading(false);
  }
};
    
    const resetBlogForm = () => {
      setBlogTitle('');
      setBlogContent('');
      setBlogImage(null);
      setEditingBlog(null);
    };
    const handleSelectBlog = (id) => {
      setSelectedBlogs((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    };
    
    const handleDeleteSelectedBlogs = async () => {
      if (selectedBlogs.length === 0) {
        alert("No blogs selected for deletion");
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');
  
      try {
        const response = await fetch("/api/blog", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedBlogs }),
        });
  
        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to delete blogs');
      }

      setSuccess('Selected blogs deleted successfully!');
      setSelectedBlogs([]);
      const fetchResponse = await fetch('/api/blog');
      const data = await fetchResponse.json();
      setBlogs(data.blogs);
  } catch (error) {
      setError(error.message || 'An error occurred while deleting blogs.');
  } finally {
      setLoading(false);
  }
};
    
    const handleEditBlog = (blog) => {
      setBlogTitle(blog.title);
      setBlogContent(blog.content);
      setBlogImage(blog.image);
      setEditingBlog(blog);
    };
    

    useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/admin/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const profile = await response.json();
      setName(profile.name || '');
      setTitleProfile(profile.title || '');
      setLinkedin(profile.linkedin || '');
      setGithub(profile.github || '');
      setWebsite(profile.website || '');
      setProfileImage(profile.image || '/images/default-profile.jpg');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (activeTab === 'profile') {
    fetchProfile();
  }
}, [activeTab]);

    

    return (
      <div className="container mx-auto p-6 text-gray-700">
      {/* Display Success Message */}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}
      {/* Display Error Message */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {/* Display Loading Spinner */}
      {loading && (
          <div className="flex justify-center items-center mb-4">
              <RotatingLines
                  visible={true}
                  height="40"
                  width="40"
                  color="grey"
                  strokeWidth="5"
                  strokeColor="grey"
                  ariaLabel="rotating-lines-loading"
              />
          </div>
      )}
      {/* Subnavbar with Extra Buttons */}
      <div className="flex flex-wrap justify-center md:justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-wrap space-x-4">
          <button
            onClick={() => handleTabClick('profile')}
            className={`flex items-center px-4 py-2 rounded-md font-bold ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Profile
          </button>
          <button
            onClick={() => handleTabClick('events')}
            className={`flex items-center px-4 py-2 rounded-md font-bold ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
            Events
          </button>
          <button
            onClick={() => handleTabClick('blogs')}
            className={`flex items-center px-4 py-2 rounded-md font-bold ${
              activeTab === 'blogs' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={faBlog} className="mr-2" />
            Blogs
          </button>
        </div>
        <div className="flex flex-wrap space-x-4 pt-8 lg:pt-0 text-xs sm:text-base">
          <button onClick={handleRegister} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">
            Register New User
          </button>
          <button onClick={() => setShowChangePasswordModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md">
            Change Password
          </button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md">
            Logout
          </button>
        </div>
      </div>

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-700">Current Password</label>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <label className="block text-lg font-semibold text-gray-700">New Password</label>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Conditional Rendering Based on Selected Tab */}
        {activeTab === 'events' ? (
          <EventsSection
            events={events}
            title={title}
            description={description}
            startDate={startDate}
            endDate={endDate}
            allDay={allDay}
            image={image}
            setTitle={setTitle}
            setDescription={setDescription}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setAllDay={setAllDay}
            eventLocation={eventLocation}
            setEventLocation={setEventLocation}
            setImage={setImage}
            handleSubmit={handleSubmit}
            handleEditEvent={handleEditEvent}
            handleDeleteSelected={handleDeleteSelected}
            handleSelectEvent={handleSelectEvent}
            selectedEvents={selectedEvents}
            resetForm={resetForm}
            editingEvent={editingEvent}
          />
        ) : activeTab === 'profile' ? (
          <ProfileSection
            name={name}
            titleProfile={titleProfile}
            linkedin={linkedin}
            github={github}
            website={website}
            profileImage={profileImage}
            setName={setName}
            setTitleProfile={setTitleProfile}
            setLinkedin={setLinkedin}
            setGithub={setGithub}
            setWebsite={setWebsite}
            setProfileImage={setProfileImage}
            handleProfileUpdate={handleProfileUpdate}
            handleImageChange={handleImageChange}
          />
        ) : (
          <BlogsSection
            name={name}
            blogs={blogs}
            blogTitle={blogTitle}
            blogContent={blogContent}
            blogImage={blogImage}
            setBlogTitle={setBlogTitle}
            setBlogContent={setBlogContent}
            setBlogImage={setBlogImage}
            handleSubmitBlog={handleSubmitBlog}
            handleEditBlog={handleEditBlog}
            handleDeleteSelectedBlogs={handleDeleteSelectedBlogs}
            handleSelectBlog={handleSelectBlog}
            selectedBlogs={selectedBlogs}
            resetBlogForm={resetBlogForm}
            editingBlog={editingBlog}
          />
        )}
      </div>
    );
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],       
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],          
    ['link', 'image', 'video'],
    [{ 'align': [] }],
  ]
};
const formats = [
  'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 
  'link', 'color', 'background', 'align', 'image', 'video'
];
// Events Section Component
const EventsSection = ({ events, title, description, startDate, endDate, allDay, eventLocation, image, setTitle, setDescription, setStartDate, setEndDate, setAllDay, setEventLocation, setImage, handleSubmit, handleEditEvent, handleDeleteSelected, handleSelectEvent, selectedEvents, resetForm, editingEvent }) => (
  <div className="flex flex-col-reverse lg:flex-row lg:space-x-8 items-center lg:items-start justify-center items-center">
    {/* Event Form */}
    <div className="w-full sm:w-[90%] lg:w-[75%] bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 text-center">Manage Events</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-lg font-semibold text-gray-700">Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
          required 
        />

        {/* Rich Text Editor for Event Description */}
        <label className="block text-lg font-semibold text-gray-700">Event Description</label>
        <ReactQuill
          value={description}
          onChange={setDescription}
          modules={modules}
          formats={formats}
          theme="snow"
          placeholder="Add event description..."
          className="mb-4 text-gray-800"
        />
        
        {/* Submit Button */}

        <label className="block text-lg font-semibold text-gray-700">Start Date</label>
        <input 
          type="datetime-local" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
          required 
        />

        <label className="block text-lg font-semibold text-gray-700">End Date</label>
        <input 
          type="datetime-local" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
          required 
        />

        <label className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
          <input 
            type="checkbox" 
            checked={allDay} 
            onChange={(e) => setAllDay(e.target.checked)} 
            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-400 border-gray-300" 
          />
          <span>All Day Event</span>
        </label>

        <label className="block text-lg font-semibold text-gray-700">Location</label>
          <input
            type="text"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />


        <label className="block text-lg font-semibold text-gray-700">Event Image <span className="font-normal">(Limit: 16 MB)</span></label>
        <input 
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp" 
          onChange={(e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
          }} 
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
        />

        <div className="flex space-x-4">
          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-200">
            {editingEvent ? 'Update Event' : 'Add Event'}
          </button>
          {editingEvent && (
            <button type="button" onClick={resetForm} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-md transition duration-200">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Event List</h3>
      <table className="w-full bg-white rounded-lg shadow-lg">
        <thead className="text-xs sm:text-base bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="p-1 sm:p-3 text-left">Select</th>
            <th className="p-1 sm:p-3 text-left">Title</th>
            <th className="p-1 sm:p-3 text-left">Date</th>
            <th className="p-1 sm:p-3 text-left">Location</th>
            <th className="p-1 sm:p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id} className="border-b border-gray-200">
              <td className="p-1 sm:p-3">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(event._id)}
                  onChange={() => handleSelectEvent(event._id)}
                  className="sm:w-5 sm:h-5 text-blue-600 focus:ring-blue-400 border-gray-300 rounded"
                />
              </td>
              <td className="p-1 sm:p-3 text-xs sm:text-base text-gray-800 font-medium">{event.title}</td>
              <td className="p-1 sm:p-3 text-xs sm:text-base text-gray-600">{new Date(event.startDate).toLocaleDateString()}</td>
              <td className="p-1 sm:p-3 text-xs sm:text-base text-gray-800">{event.eventLocation || 'No Location'}</td>
              <td className="p-1 sm:p-3">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="text-xs sm:text-base text-blue-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleDeleteSelected}
        className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition duration-200"
      >
        Delete Selected
      </button>
    </div>

    {/* Live Event Preview */}
    <div className="lg:w-1/2 flex flex-col justify-center items-center text-gray-900 text-xl mb-4 lg:mt-60">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
        Live Event Preview
      </h2>
      <div
        className="border-solid border-2 border-black shadow-lg text-start p-6 rounded-lg
                    w-[400px] sm:w-[500px] 
                    h-auto"
        style={{ wordBreak: 'break-word' }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full sm:h-64 h-48 object-cover rounded-md mb-4"
          />
        )}
        <h2 className="text-3xl font-bold text-black text-center mb-4">
          {title || 'Event Title'}
        </h2>
        <div
          className="text-gray-700 text-lg leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: description || 'Event description will appear here.',
          }}
        ></div>
        <p className="text-gray-800 text-center mb-4">
          <strong>Start Date:</strong>{' '}
          {startDate
            ? moment(startDate).format('MMMM Do, YYYY [at] h:mm A')
            : 'Select a date'}
          <br />
          {allDay ? (
            <strong>All Day Event</strong>
          ) : (
            <>
              <strong>Time:</strong>{' '}
              {startDate && endDate
                ? `${moment(startDate).format('h:mm A')} - ${moment(endDate).format(
                    'h:mm A'
                  )}`
                : 'Select a time'}
            </>
          )}
          <br />
          <strong>Location:</strong> {eventLocation || 'No Location Provided'}
        </p>
      </div>
    </div>

  </div>
);


const ProfileSection = ({
  name, titleProfile, linkedin, github, website, profileImage,
  setName, setTitleProfile, setLinkedin, setGithub, setWebsite,
  setProfileImage, handleProfileUpdate, handleImageChange
}) => (
  <div className="flex flex-col-reverse lg:flex-row lg:space-x-8 justify-center items-center">
    {/* Profile Form */}
    <div className="w-full sm:w-[90%] lg:w-[75%] bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 text-center">Update Profile</h2>
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <label className="block text-lg font-semibold text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-lg font-semibold text-gray-700">Title</label>
        <input
          type="text"
          value={titleProfile}
          onChange={(e) => setTitleProfile(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-lg font-semibold text-gray-700">LinkedIn</label>
        <input
          type="text"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-lg font-semibold text-gray-700">GitHub</label>
        <input
          type="text"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-lg font-semibold text-gray-700">Website</label>
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-lg font-semibold text-gray-700">Profile Image <span className="font-normal">(Limit: 16 MB)</span></label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
          onChange={(e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setProfileImage(reader.result);
            reader.readAsDataURL(file);
          }}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-200">
          Save Profile
        </button>
      </form>
    </div>

    {/* Live Profile Preview */}
<div className="lg:w-1/2 flex flex-col justify-center items-center text-gray-900 text-xl">
  <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
    Live Profile Preview
  </h2>
  <div
    className="
      our-team 
      border-2 border-black 
      shadow-lg 
      text-center 
      p-8 
      rounded-lg 
      w-[400px] h-[300px]      /* default for screens < 640px */
      sm:w-[500px] sm:h-[300px] /* for screens >= 640px        */
    "
  >
    <div className="picture mb-4">
      <img
        src={profileImage || '/images/default-profile.jpg'}
        alt={name || 'Default Name'}
        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full mx-auto"
      />
    </div>
    <div className="team-content">
      <h3 className="name">{name || 'Officer Name'}</h3>
      <h4 className="title text-gray-600 text-lg">
        {titleProfile || 'Officer Title'}
      </h4>
    </div>
    <ul className="social flex justify-center mt-4 space-x-4">
      {linkedin && (
        <li>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faLinkedin} size="lg" />
          </a>
        </li>
      )}
      <li>
        <a
          href={`mailto:example@example.com`}
          className="text-blue-600 hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faEnvelope} size="lg" />
        </a>
      </li>
      {github && (
        <li>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faGithub} size="lg" />
          </a>
        </li>
      )}
      {website && (
        <li>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon={faGlobe} size="lg" />
          </a>
        </li>
      )}
    </ul>
  </div>
</div>

  </div>
);

const BlogsSection = ({
  blogs,
  blogTitle,
  blogContent,
  blogImage,
  setBlogTitle,
  setBlogContent,
  setBlogImage,
  handleSubmitBlog,
  handleEditBlog,
  handleDeleteSelectedBlogs,
  handleSelectBlog,
  selectedBlogs,
  resetBlogForm,
  editingBlog,
  name
}) => (
  <div className="flex flex-col-reverse lg:flex-row lg:space-x-8 items-center lg:items-start justify-center items-center">
    {/* Blog Form */}
    <div className="w-full sm:w-[90%] lg:w-[75%] bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 text-center">
        {editingBlog ? 'Edit Blog Post' : 'Create Blog Post'}
      </h2>
      <form onSubmit={handleSubmitBlog} className="space-y-4">
        <label className="block text-lg font-semibold text-gray-700">Title</label>
        <input
          type="text"
          value={blogTitle}
          onChange={(e) => setBlogTitle(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {/* Rich Text Editor for Blog Content */}
        <label className="block text-lg font-semibold text-gray-700">Content</label>
        <ReactQuill
          value={blogContent}
          onChange={setBlogContent}
          modules={modules}
          formats={formats}
          theme="snow"
          placeholder="Write your blog content here..."
          className="mb-4 text-gray-800"
        />

        <label className="block text-lg font-semibold text-gray-700">Blog Image <span className="font-normal">(Limit: 16 MB)</span></label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
          onChange={(e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setBlogImage(reader.result);
            reader.readAsDataURL(file);
          }}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-200"
          >
            {editingBlog ? 'Update Blog' : 'Create Blog'}
          </button>
          {editingBlog && (
            <button
              type="button"
              onClick={resetBlogForm}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-md transition duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Blog Posts</h3>
      <table className="w-full bg-white rounded-lg shadow-lg">
        <thead className="bg-gray-100 text-xs sm:text-base text-gray-700 font-semibold">
          <tr>
            <th className="p-1 sm:p-3 text-left">Select</th>
            <th className="p-1 sm:p-3 text-left">Title</th>
            <th className="p-1 sm:p-3 text-left">Author</th>
            <th className="p-1 sm:p-3 text-left">Date</th>
            <th className="p-1 sm:p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog._id} className="border-b border-gray-200">
              <td className="p-1 sm:p-3">
                <input
                  type="checkbox"
                  checked={selectedBlogs.includes(blog._id)}
                  onChange={() => handleSelectBlog(blog._id)}
                  className="sm:w-5 sm:h-5 text-xs sm:text-base text-blue-600 focus:ring-blue-400 border-gray-300 rounded"
                />
              </td>
              <td className="p-1 sm:p-3 text-xs sm:text-base text-gray-800 font-medium">{blog.title}</td>
              <td className="p-1 sm:p-3 text-xs sm:text-base text-gray-800">{blog.author || 'Unknown Author'}</td>
              <td className="p-1 sm:p-3 text-xs sm:text-base text-gray-600">{moment(blog.createdAt).format('LL')}</td>
              <td className="p-1 sm:p-3 text-xs sm:text-base">
                <button
                  onClick={() => handleEditBlog(blog)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleDeleteSelectedBlogs}
        className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition duration-200"
      >
        Delete Selected
      </button>
    </div>

{/* Live Blog Preview */}
<div className="lg:w-1/2 flex flex-col justify-center items-center text-gray-900 text-xl mb-4 lg:mt-60">
  <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
    Live Blog Preview
  </h2>
  <div
    className="border-solid border-2 border-black shadow-lg text-start p-6 rounded-lg
                w-[400px] sm:w-[500px] 
                h-auto"
    style={{ wordBreak: 'break-word' }}
  >
    {blogImage && (
      <img
        src={blogImage}
        alt={blogTitle}
        className="w-full sm:h-64 h-48 object-cover rounded-md mb-4"
      />
    )}
    <h2 className="text-3xl font-bold text-black text-center mb-4">
      {blogTitle || 'Blog Title'}
    </h2>
    <p className="text-gray-500 text-sm text-center mb-4">
      <strong>Author:</strong> {editingBlog?.author || name || 'Your Name'} |{' '}
      <strong>Published:</strong>{' '}
      {editingBlog?.createdAt
        ? moment(editingBlog.createdAt).format('MMMM DD, YYYY')
        : moment().format('MMMM DD, YYYY')}
    </p>
    <div
      className="text-gray-700 text-lg leading-relaxed mb-6 ql-editor"
      dangerouslySetInnerHTML={{
        __html: blogContent || 'Blog content will appear here.',
      }}
    ></div>
  </div>
</div>

  </div>
);
