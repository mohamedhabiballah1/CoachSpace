import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {

 
  return (
    <div className="login-container">
        <div className="flex items-center justify-center min-h-screen bg-gray-100">                                                                            
          <div className="bg-white p-8 rounded-lg shadow-lg">                                                                                                  
            <h1 className="text-2xl font-bold text-purple-600">Hello World</h1>                                                                                
          </div>                                                                                                                                               
        </div> 
    </div>
  );
};

export default Login;
