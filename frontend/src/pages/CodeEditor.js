import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { challengeAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Play, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const CodeEditor = () => {
  const { challengeId } = useParams();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const sampleChallenge = {
    id: challengeId,
    title: 'Password Cracker',
    description: 'Write a Python script that cracks a simple password hash. The function should take a hash and a list of common passwords, then return the matching password.',
    difficulty: 'Beginner',
    language: 'python',
    starter_code: `def crack_password(hash, passwords):\n    # Your code here\n    pass\n\n# Test\ntest_hash = "5f4dcc3b5aa765d61d8327deb882cf99"\ncommon_passwords = ["password", "123456", "qwerty"]\nresult = crack_password(test_hash, common_passwords)\nprint(f"Cracked password: {result}")`,
    test_cases: [
      { input: '5f4dcc3b5aa765d61d8327deb882cf99', expected: 'password' }
    ],
    xp_reward: 50
  };

  useState(() => {
    setCode(sampleChallenge.starter_code);
  }, []);

  const handleRunCode = async () => {
    setRunning(true);
    try {
      const response = await challengeAPI.execute({
        language: sampleChallenge.language,
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
                  <span className={`text-xs font-mono px-2 py-1 rounded-sm font-bold ${
                    sampleChallenge.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                    sampleChallenge.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                    'bg-accent/20 text-accent'
                  }`}>
                    {sampleChallenge.difficulty}
                  </span>
                  <span className="text-xs font-mono bg-secondary/20 text-secondary px-2 py-1 rounded-sm uppercase">
                    {sampleChallenge.language}
                  </span>
                  <span className="text-xs font-mono text-primary">+{sampleChallenge.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="cyber-card rounded-sm overflow-hidden">
                <div className="bg-surface p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm font-mono text-textMain font-bold">Code Editor</span>
                  <span className="text-xs font-mono text-secondary uppercase">{sampleChallenge.language}</span>
                </div>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="terminal-bg text-primary font-mono text-sm min-h-[500px] resize-none border-none rounded-none focus-visible:ring-0"
                  placeholder="Write your code here..."
                  data-testid="code-editor"
                />
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
                <div className="terminal-bg p-4 min-h-[300px] font-mono text-sm whitespace-pre-wrap" data-testid="code-output">
                  {output || 'Output will appear here...'}
                </div>
              </div>

              <div className="cyber-card p-4 rounded-sm">
                <h3 className="text-lg font-heading font-bold text-textMain mb-3">Test Cases</h3>
                <div className="space-y-2">
                  {sampleChallenge.test_cases.map((test, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-sm" data-testid={`test-case-${idx}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-textMuted" />
                        <span className="text-xs font-mono text-textMuted">Test Case {idx + 1}</span>
                      </div>
                      <div className="text-sm font-mono text-textMuted">
                        <div>Input: {test.input}</div>
                        <div>Expected: {test.expected}</div>
                      </div>
                    </div>
                  ))}
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
