import React from 'react';

function Navbar() {
        return (
            <div class="text-lg items-center">
                <div class="flex max-w-4xl mx-auto justify-between">
                    <div class="py-3">DevMentor</div>
                    <div class="flex space-x-9 items-center">
                    <div class="flex space-x-6">
                        <a href="#" class="py-3 px-3">Home</a>
                        <a href="#" class="py-3 px-3">About</a>
                        <a href="#" class="py-3 px-3">Login</a>
                    </div>
                    <a href="#" class=" px-2 py-1 bg-green-300 text-white rounded shadow hover:shadow-md transition: duration-500 ease-in-out">Register</a>
                    </div>
                </div>
            </div>
        )
}

export default Navbar
