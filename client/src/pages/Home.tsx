import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * Home page component
 * 
 * This is the main landing page of the personal website
 * It includes personal information, skills, and links to other sections
 */
export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-12">
        <div className="text-2xl font-bold">My Portfolio</div>
        <div className="flex gap-4">
          <Link href="/">
            <a className="hover:text-blue-600 transition-colors">Home</a>
          </Link>
          <Link href="/ping-pong">
            <a className="hover:text-blue-600 transition-colors">Ping Pong</a>
          </Link>
        </div>
      </nav>
      
      {/* Hero section */}
      <section className="flex flex-col md:flex-row items-center justify-between py-12">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Hi, I'm <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Your Name</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Front-end Developer | UI/UX Enthusiast | Game Developer
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
            I build engaging and interactive web experiences. Check out my Ping Pong game to see
            my skills in action!
          </p>
          <div className="flex gap-4">
            <Link href="/ping-pong">
              <Button>Play Ping Pong</Button>
            </Link>
            <Button variant="outline">Contact Me</Button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl">
            YN
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-6">About Me</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              I'm a passionate web developer specializing in creating interactive and engaging
              user experiences. With a strong foundation in modern JavaScript frameworks and game
              development, I love bringing creative ideas to life on the web.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              When I'm not coding, you can find me exploring new technologies, contributing to
              open-source projects, or playing ping pong!
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">React</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">TypeScript</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">HTML/CSS</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">JavaScript</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">Canvas API</div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">Game Development</div>
            </div>
          </div>
        </div>
      </section>

      {/* Project section - highlighting the Ping Pong game */}
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-6">Featured Project</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl">
            Ping Pong Game
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Interactive Ping Pong</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A fun, browser-based implementation of the classic ping pong game using HTML Canvas
              and JavaScript. Challenge yourself or play against a friend!
            </p>
            <Link href="/ping-pong">
              <Button>Play Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Your Name. All rights reserved.</p>
          <p className="mt-2">Built with React and TypeScript</p>
        </div>
      </footer>
    </div>
  );
}