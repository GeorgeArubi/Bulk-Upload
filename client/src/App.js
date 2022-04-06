import React from 'react'
import Uppy from '@uppy/core'
import AwsS3 from '@uppy/aws-s3'
import { Dashboard } from '@uppy/react'
import ms from 'ms'


const uppy  = new Uppy({
  autoProceed: false,
  restrictions: {
    maxFileSize: 10000000, // Uppy options, currently set max file size to 1MB
    minNumberofFile: 1, // Set a max/min number of files
    allowedFileTypes: ['audio/*'] // This restriction is currently set to accept any audio format (for specific file types use 'audio/wav', 'audio/mp3', etc.)
  }  
})
uppy.use(AwsS3, { 
  limit: 2, // Limit the amount of uploads going on at the same time. 
  timeout: ms('1 minute'), // Abort upload after 1 minute if no upload progress.
  companionUrl: 'http://localhost:8080', //  Root URL of the uppy-companion instance
}) // Create metaFields object to specify the metadata that should be stored in S3.
  

const App = () => {
  return (
    <>
      <div className="flex min-h-screen justify-center items-center">
          <div className="max-w-xs rounded overflow-hidden shadow-lg my-2">
            <img
              className="w-full"
              src={`https://tailwindcss.com/img/card-top.jpg`}
              alt="Sunset in the mountains"
              width={640}
              height={480}
            />
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Next + Tailwind ❤️</div>
              <p className="text-grey-darker text-base">
                Next and Tailwind CSS are a match made in heaven, check out this article on how
                you can combine these two for your next app.
              </p>
            </div>
            <Dashboard uppy = { uppy } /> 
        </div>
      </div>
    </>
  )
}

export default App
