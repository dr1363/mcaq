import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import Navbar from '../components/Navbar';
import { labAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Square, Terminal as TerminalIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const LabPage = () => {
  const { sessionId } = useParams();
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const terminal = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
        theme: {
          background: '#000000',
          foreground: '#00ff41',
          cursor: '#00ff41',
          black: '#000000',
          red: '#ff003c',
          green: '#00ff41',
          yellow: '#ffff00',
          blue: '#00f3ff',
          magenta: '#ff00ff',
          cyan: '#00f3ff',
          white: '#e0e0e0',
        },
        scrollback: 1000,
        rows: 30,
        cols: 100,
      });

      const webLinksAddon = new WebLinksAddon();
      terminal.loadAddon(webLinksAddon);
      terminal.open(terminalRef.current);
      
      xtermRef.current = terminal;

      terminal.writeln('\x1b[1;32m=== HackLidoLearn Lab Terminal ===\x1b[0m');
      terminal.writeln('\x1b[36mConnected to lab environment\x1b[0m');
      terminal.writeln('\x1b[33mType commands below and press Enter to execute\x1b[0m');
      terminal.writeln('');
      writePrompt(terminal);

      terminal.onData((data) => {
        handleTerminalInput(data, terminal);
      });

      return () => {
        if (terminal) {
          terminal.dispose();
        }
      };
    }
    // eslint-disable-next-line
  }, []);

  const writePrompt = (terminal) => {
    terminal.write('\x1b[1;32mhacker@lab\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
  };

  const handleTerminalInput = (data, terminal) => {
    const code = data.charCodeAt(0);

    if (code === 13) {
      terminal.write('\r\n');
      if (currentCommand.trim()) {
        executeCommand(currentCommand.trim(), terminal);
        setCommandHistory(prev => [...prev, currentCommand]);
        setHistoryIndex(-1);
        setCurrentCommand('');
      } else {
        writePrompt(terminal);
      }
    } else if (code === 127) {
      if (currentCommand.length > 0) {
        setCurrentCommand(prev => prev.slice(0, -1));
        terminal.write('\b \b');
      }
    } else if (code === 27) {
      // Handle escape sequences (arrow keys)
    } else if (code >= 32 && code <= 126) {
      setCurrentCommand(prev => prev + data);
      terminal.write(data);
    }
  };

  const executeCommand = async (command, terminal) => {
    try {
      const response = await labAPI.execute(sessionId, command);
      const output = response.data.output || '';
      
      if (output) {
        output.split('\n').forEach(line => {
          terminal.writeln(line);
        });
      }
      
      if (response.data.exit_code !== 0) {
        terminal.writeln(`\x1b[31mExit code: ${response.data.exit_code}\x1b[0m`);
      }
    } catch (error) {
      terminal.writeln(`\x1b[31mError executing command: ${error.message}\x1b[0m`);
    } finally {
      writePrompt(terminal);
    }
  };

  const handleStopLab = async () => {
    try {
      await labAPI.stop(sessionId);
      toast.success('Lab stopped');
      if (xtermRef.current) {
        xtermRef.current.writeln('');
        xtermRef.current.writeln('\x1b[31m=== Lab session terminated ===\x1b[0m');
      }
    } catch (error) {
      toast.error('Failed to stop lab');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="lab-page">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-surface/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TerminalIcon className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-heading font-bold text-primary" data-testid="lab-title">Interactive Lab Terminal</h2>
                  <p className="text-xs font-mono text-textMuted">Session: {sessionId}</p>
                </div>
              </div>
              <Button
                onClick={handleStopLab}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 font-bold uppercase tracking-wider"
                data-testid="stop-lab-button"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Lab
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="max-w-7xl mx-auto h-full">
            <div className="cyber-card h-full rounded-sm overflow-hidden">
              <div className="bg-black/50 p-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="ml-2 text-xs font-mono text-textMuted">bash</span>
              </div>
              <div 
                ref={terminalRef} 
                className="h-[calc(100%-40px)] bg-black p-2"
                data-testid="terminal-container"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-surface/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 text-sm text-textMuted font-mono">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>Tip: Use standard Linux commands. Type 'help' for available commands.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
