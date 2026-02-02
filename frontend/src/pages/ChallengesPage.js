import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { challengeAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Code, Filter } from 'lucide-react';
import { toast } from 'sonner';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (selectedLanguage === 'all') {
      setFilteredChallenges(challenges);
    } else {
      setFilteredChallenges(challenges.filter(c => c.language === selectedLanguage));
    }
  }, [selectedLanguage, challenges]);

  const fetchChallenges = async () => {
    try {
      const response = await challengeAPI.getAll();
      setChallenges(response.data);
      setFilteredChallenges(response.data);
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const sampleChallenges = [
    {
      id: 'sample-1',
      title: 'Password Cracker',
      description: 'Write a Python script to crack a simple password hash using common passwords',
      difficulty: 'Beginner',
      language: 'python',
      xp_reward: 50
    },
    {
      id: 'sample-2',
      title: 'Port Scanner',
      description: 'Create a basic port scanner that checks common ports on a target IP',
      difficulty: 'Intermediate',
      language: 'python',
      xp_reward: 100
    },
    {
      id: 'sample-3',
      title: 'Log Parser',
      description: 'Parse web server logs and extract suspicious IP addresses',
      difficulty: 'Beginner',
      language: 'bash',
      xp_reward: 50
    },
    {
      id: 'sample-4',
      title: 'SQL Injection Detector',
      description: 'Build a function that detects potential SQL injection patterns in user input',
      difficulty: 'Advanced',
      language: 'javascript',
      xp_reward: 150
    },
    {
      id: 'sample-5',
      title: 'Caesar Cipher',
      description: 'Implement a Caesar cipher encoder and decoder',
      difficulty: 'Beginner',
      language: 'python',
      xp_reward: 50
    },
    {
      id: 'sample-6',
      title: 'Base64 Decoder',
      description: 'Create a script that decodes Base64 encoded strings',
      difficulty: 'Beginner',
      language: 'bash',
      xp_reward: 50
    },
  ];

  const displayChallenges = filteredChallenges.length > 0 ? filteredChallenges : sampleChallenges;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading challenges...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="challenges-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2 glow-text" data-testid="challenges-title">
            CODING CHALLENGES
          </h1>
          <p className="text-textMuted font-mono">Practice Python, Bash, and JavaScript</p>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <Filter className="w-5 h-5 text-primary" />
          <div className="flex gap-2">
            {['all', 'python', 'bash', 'javascript'].map((lang) => (
              <Button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                variant={selectedLanguage === lang ? 'default' : 'outline'}
                className={selectedLanguage === lang ? 
                  'bg-primary text-black font-bold uppercase' : 
                  'border-primary text-primary hover:bg-primary/10 font-bold uppercase'
                }
                data-testid={`filter-${lang}`}
              >
                {lang}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayChallenges.map((challenge, idx) => (
            <Link key={challenge.id} to={`/challenges/${challenge.id}`} data-testid={`challenge-${idx}`}>
              <div className="cyber-card p-6 rounded-sm hover:border-primary/50 transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <Code className="w-8 h-8 text-primary" />
                  <span className={`text-xs font-mono px-2 py-1 rounded-sm font-bold ${
                    challenge.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                    challenge.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                    'bg-accent/20 text-accent'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-bold text-textMain mb-2">{challenge.title}</h3>
                <p className="text-textMuted text-sm mb-4 line-clamp-3">{challenge.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-secondary/20 text-secondary px-2 py-1 rounded-sm uppercase">
                    {challenge.language}
                  </span>
                  <span className="text-xs font-mono text-primary">+{challenge.xp_reward} XP</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {displayChallenges.length === 0 && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-textMuted mx-auto mb-4" />
            <p className="text-textMuted font-mono">No challenges found for the selected filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengesPage;
