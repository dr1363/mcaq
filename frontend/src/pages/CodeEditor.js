import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { challengeAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Play, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const { challengeId } = useParams();
  const [code, setCode] = useState('# Write your Python code here\ndef solve():\n    # Your solution\n    pass\n\nsolve()');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [language, setLanguage] = useState('python');

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const response = await challengeAPI.execute({
        language: language,
        code: code
      });
      
      const result = response.data.output || response.data.stdout || '';
      const error = response.data.stderr || '';
      
      if (error) {
        setOutput(`❌ Error:\n${error}`);
        toast.error('Code execution failed');
      } else {
        setOutput(`✅ Success!\n\n${result}`);
        toast.success('Code executed successfully!');
      }
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
      toast.error('Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="code-editor-page">
      <Navbar />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="cyber-card p-6 rounded-sm mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="w-10 h-10 text-primary" />
                <div>
                  <h1 className="text-3xl font-heading font-bold text-primary mb-2 glow-text" data-testid="challenge-title">
                    Programming Challenge
                  </h1>
                  <p className="text-textMuted">Write, test, and debug your code</p>
                </div>
              </div>
              
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black/50 border border-primary/30 text-white font-mono px-4 py-2 rounded text-lg font-bold"
              >
                <option value="python">🐍 Python</option>
                <option value="javascript">⚡ JavaScript</option>
                <option value="bash">💻 Bash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="cyber-card rounded-sm overflow-hidden">
              <div className="bg-surface p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-lg font-mono text-textMain font-bold uppercase">Code Editor</span>
                <Button
                  onClick={handleRunCode}
                  disabled={running}
                  className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider px-8"
                  data-testid="run-code-button"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {running ? 'Running...' : 'Run Code'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="bg-[#1e1e1e]" data-testid="code-editor">
                  <Editor
                    height="600px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 15,
                      fontFamily: 'JetBrains Mono, monospace',
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      cursorBlinking: 'smooth',
                    }}
                  />
                </div>
                
                <div>
                  <div className="bg-surface p-3 border-b border-white/10">
                    <span className="text-sm font-mono text-textMain font-bold">Console Output</span>
                  </div>
                  <div className="terminal-bg p-4 h-[600px] font-mono text-sm whitespace-pre-wrap overflow-y-auto" data-testid="code-output">
                    {output || '> Console ready...\n> Click "Run Code" to execute your program\n> Output will appear here'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
