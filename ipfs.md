#IPFS CONFIG
    [install ipfs](https://ipfs.io/docs/install/) 

    ipfs init

    ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
    ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
    ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Headers '["X-Requested-With"]'
    ipfs config --json Gateway.Writable true

    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST", "OPTIONS"]'
    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
    ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["X-Requested-With"]'
    ipfs config --json API.Writable true

    ipfs daemon