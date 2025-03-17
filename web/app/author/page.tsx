export default function AuthorPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-6">About the Author</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Siddhant Ota</h2>
        <p className="text-lg mb-4">
          Hi! I'm Siddhant, a passionate Full Stack Developer who loves building innovative solutions
          and meaningful applications.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">About DevMentor</h3>
        <p className="text-lg mb-4">
          DevMentor is a project I created to help developers improve their coding skills through
          AI-powered mentorship. It combines modern web technologies with artificial intelligence
          to provide personalized learning experiences.
        </p>
        <p className="text-lg mb-4">
          The project uses Next.js for the frontend, integrates with Anthropic's Claude AI,
          and aims to make programming education more accessible and interactive.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Tech Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-2">Frontend</h4>
            <ul className="list-disc list-inside text-lg">
              <li>Next.js & React</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Anthropic Claude AI</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2">Backend</h4>
            <ul className="list-disc list-inside text-lg">
              <li>LangChain</li>
              <li>Python</li>
              <li>Docker</li>
              <li>Isolated Code Execution</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <p className="text-lg italic">
          "I believe in the power of technology to transform education and make learning
          more engaging and effective."
        </p>
      </div>
    </div>
  );
}
