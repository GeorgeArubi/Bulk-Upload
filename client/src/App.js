import React from 'react'
import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { Dashboard } from '@uppy/react'
import ms from 'ms'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import './App.css'

const App = () => {
  const uppy  = new Uppy({
    autoProceed: false,
    restrictions: {
      maxFileSize: 1000000000, // Uppy options, currently set max file size to 100MB
      minNumberofFile: 1, // Set a max/min number of files
      allowedFileTypes: ['audio/*'] // This restriction is currently set to accept any audio format (for specific file types use 'audio/wav', 'audio/mp3', etc.)
    }  
  })
  uppy.use(AwsS3, { 
    limit: 2, // Limit the amount of uploads going on at the same time. 
    timeout: ms('1 minute'), // Abort upload after 1 minute if no upload progress.
    companionUrl: 'http://localhost:8080',
    metaFields: ['name', 'bulk-upload'] //  Root URL of the uppy-companion instance
  }) 
  // Create 'metaFields' object to specify the metadata that should be stored in S3.
  // Look at using 'companionHeaders' to specify custom headers that should be sent along to Companion on every request. 
  
  uppy.on('success', (fileCount) => {
    console.log(`${fileCount} files uploaded`)
  })
  

  return (
    <>
      <div className="flex min-h-screen justify-center items-center">
        <div className="max-w-xs rounded overflow-hidden shadow-lg my-2">
          <Dashboard className="w-full" uppy={ uppy } />
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">Uppy Bulk Upload</div>
            <p className="text-grey-darker text-base">
              Frontend: React, Uppy and Tailwind CSS. This interface should allow for drag/drop 
              and file input methods. I think we can target a div id to build custom components.
              See: 
            </p>
          </div>
          
        </div>
        
      </div>
      
    </>
  )
}

export default App
