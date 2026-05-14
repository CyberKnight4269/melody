export default function Navbar() {
  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  return (
    <div className="navbar">
      <h2>MusicApp</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}