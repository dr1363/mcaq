import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { challengeAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Play, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

const CodeEditor = () => {
  const { challengeId } = useParams();
  const [code, setCode] = useState('def crack_password(hash, passwords):\n    # Your code here\n    pass\n\n# Test\ntest_hash = "5f4dcc3b5aa765d61d8327deb882cf99"\ncommon_passwords = ["password", "123456", "qwerty"]\nresult = crack_password(test_hash, common_passwords)\nprint(f"Cracked password: {result}")');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [language, setLanguage] = useState('python');

  const sampleChallenge = {
    id: challengeId,
    title: 'Password Cracker',
    description: 'Write a Python script to crack MD5 password hashes',
    difficulty: 'Beginner',
    xp_reward: 50
  };

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
        setOutput(`Error:\n${error}`);
        toast.error('Code execution failed');
      } else {
        setOutput(result);
        toast.success('Code executed successfully!');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary mb-2 glow-text" data-testid="challenge-title">
                  {sampleChallenge.title}
                </h1>
                <p className="text-textMuted mb-4">{sampleChallenge.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-1 rounded-sm font-bold bg-primary/20 text-primary">
                    {sampleChallenge.difficulty}
                  </span>
                  <span className="text-xs font-mono text-primary">+{sampleChallenge.xp_reward} XP</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-black/50 border border-white/20 text-white font-mono p-2 rounded"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="bash">Bash</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="cyber-card rounded-sm overflow-hidden">
                <div className="bg-surface p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm font-mono text-textMain font-bold">Code Editor (Monaco - VS Code)</span>
                  <span className="text-xs font-mono text-secondary uppercase">{language}</span>
                </div>
                <div className="bg-[#1e1e1e]" data-testid="code-editor">
                  <Editor
                    height="500px"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: 'on',
                    }}
                  />
                </div>
                <div className="p-3 border-t border-white/10">
                  <Button
                    onClick={handleRunCode}
                    disabled={running}
                    className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider w-full"
                    data-testid="run-code-button"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {running ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="cyber-card rounded-sm overflow-hidden mb-6">
                <div className="bg-surface p-3 border-b border-white/10">
                  <span className="text-sm font-mono text-textMain font-bold">Output</span>
                </div>
                <div className="terminal-bg p-4 min-h-[300px] font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto" data-testid="code-output">
                  {output || '> Output will appear here...\n> Click "Run Code" to execute'}
                </div>
              </div>

              <div className="cyber-card p-4 rounded-sm">
                <h3 className="text-lg font-heading font-bold text-textMain mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Instructions
                </h3>
                <div className="text-sm text-textMuted space-y-2">
                  <p>• Write your solution in the editor above</p>
                  <p>• Click "Run Code" to test your solution</p>
                  <p>• Use print() statements to debug</p>
                  <p>• Submit when all test cases pass</p>
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
