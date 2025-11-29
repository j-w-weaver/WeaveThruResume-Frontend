import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            WeavThru Resume 🎯
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            AI-Powered Resume Optimization
          </p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
            Get Started
          </button>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
