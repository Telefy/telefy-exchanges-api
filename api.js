"use strict";
const axios = require("axios");
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
var bodyParser = require('body-parser');

const UniswapV2Pair = require("./abi/IUniswapV2Pair.json");
require("dotenv").config({});
const Web3 = require("web3");
const Provider = require('@truffle/hdwallet-provider');
const provider = new Provider("89ffe7016912c892dbd513c83099b4cde7f2e3fd2f07b469241ccd078dea90ab", "https://mainnet.infura.io/v3/01ec171f81164847811fed95c4c236ff"); 
const web3http = new Web3(provider);


/// --- GET A UNISWAP WETH-USDC RESEVER PIRCE -- ///

router.get('/checkUsdc/reserve/UNISWAP',async(req,res) => {
  let response = {}
  response.data = []
  let statusCode = 200

  const PAIR_ADDR = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
  const resevers = await getReserves(PAIR_ADDR);
  if(resevers.length > 0) {

    response.data = [{reserve0: resevers[0],reserve1: resevers[1]}] 
  }

  res.status(statusCode).json(response)
});

/// --- GET A SUSHISWAP WETH-USDC RESEVER PIRCE -- ///

router.get('/checkUsdc/reserve/SUSHISWAP',async(req,res) => {
  let response = {}
  response.data = []
  let statusCode = 200

  const PAIR_ADDR = "0x397ff1542f962076d0bfe58ea045ffa2d347aca0";
  const resevers = await getReserves(PAIR_ADDR);
  if(resevers.length > 0) {

    response.data = [{reserve0: resevers[0],reserve1: resevers[1]}] 
  }

  res.status(statusCode).json(response)
});



       // CHECK USDC PAIRS //

router.post("/checkUsdc/UNISWAP", async (req, res) => {
  let response = {};
  response.data = '';
  let statusCode = 200;

  let token0 = req.body.token0;
  let token1 = req.body.token1;
    let result = await axios.post(
      "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
      {
        query: `
                {
                  pairs(where: 
                    {
                      token0: "${token0}",
                      token1: "${token1}"
                    }) {
                    id
                    token0 {
                      id
                      symbol
                      decimals
                    }
                    token1 {
                      id
                      symbol
                      decimals
                    }
                    reserve0
                    reserve1
                  }
                }
              `,
      }
    );
    if (result.data.data.pairs.length > 0) {
      let reserve0 = result.data.data.pairs[0].reserve0.split(".");     
      let reserve1 = result.data.data.pairs[0].reserve1.split(".");
      if (
        parseInt(reserve0[1].length) !==
        parseInt(result.data.data.pairs[0].token0.decimals)
      ) {
        

        for (var i = reserve0[1].length; i < parseInt(result.data.data.pairs[0].token0.decimals); i++) {
          reserve0[1] += "0";
        }
        result.data.data.pairs[0].reserve0 = reserve0[0]+reserve0[1];
        
      } else {
        result.data.data.pairs[0].reserve0 = result.data.data.pairs[0].reserve0.replace(".", "");
      }
      if (
        parseInt(reserve1[1].length) !==
        parseInt(result.data.data.pairs[0].token1.decimals)
      ) {
        

        for (var i = reserve1[1].length; i < parseInt(result.data.data.pairs[0].token1.decimals)+2; i++) {
          reserve1[1] += "0";
        }
        result.data.data.pairs[0].reserve1 = reserve1[0]+reserve1[1];
        
      }  else {
        result.data.data.pairs[0].reserve1 = result.data.data.pairs[0].reserve1.replace(".", "");
      }
      response.data = result.data.data;
      response.shuffle = 0;
      response.status = "SUCCESS";
    } else {
        let result = await axios.post(
          "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
          {
            query: `
                    {
                      pairs(where: 
                        {
                          token0: "${token1}",
                          token1: "${token0}"
                        }) {
                        id
                        token0 {
                          id
                          symbol
                          decimals
                        }
                        token1 {
                          id
                          symbol
                          decimals
                        }
                        reserve0
                        reserve1
                      }
                    }
                  `,
          }
        );
        if (result.data.data.pairs.length > 0) {
          let reserve0 = result.data.data.pairs[0].reserve0.split(".");
          let reserve1 = result.data.data.pairs[0].reserve1.split(".");
          if (
            parseInt(reserve0[1].length) !==
            parseInt(result.data.data.pairs[0].token0.decimals)
          ) {
            for (
              var i = reserve0[1].length;
              i < parseInt(result.data.data.pairs[0].token0.decimals);
              i++
            ) {
              reserve0[1] += "0";
            }
            result.data.data.pairs[0].reserve0 = reserve0[0] + reserve0[1];
          } else {
            result.data.data.pairs[0].reserve0 =
              result.data.data.pairs[0].reserve0.replace(".", "");
          }
          if (
            parseInt(reserve1[1].length) !==
            parseInt(result.data.data.pairs[0].token1.decimals)
          ) {
            for (
              var i = reserve1[1].length;
              i < parseInt(result.data.data.pairs[0].token1.decimals) + 2;
              i++
            ) {
              reserve1[1] += "0";
            }
            result.data.data.pairs[0].reserve1 = reserve1[0] + reserve1[1];
          } else {
            result.data.data.pairs[0].reserve1 =
              result.data.data.pairs[0].reserve1.replace(".", "");
          }
          response.data = result.data.data;
          response.shuffle = 1;
          response.status = "SUCCESS";
        } else {
          response.data = '';
          response.shuffle = 0;
          response.status = "SUCCESS";
        }
      
    }
 
  res.status(statusCode).json(response);
});

router.post('/checkUsdc/SUSHISWAP',async(req,res) => {
  let response = {}
  response.data = ''
  let statusCode = 200

  let token0 =  req.body.token0;
  let token1 =  req.body.token1;   
      let result = await axios.post(
        "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
        {
          query: `
          {
            pairs(where: 
              {
                token0: "${token0}",
                token1: "${token1}"
              }) {
              id
              token0 {
                id
                symbol
                decimals
              }
              token1 {
                id
                symbol
                decimals
              }
              reserve0
              reserve1
            }
          }
        `,
        }
      );
      if (result.data.data.pairs.length > 0) {
        let reserve0 = result.data.data.pairs[0].reserve0.split(".");
        let reserve1 = result.data.data.pairs[0].reserve1.split(".");
        if (
          parseInt(reserve0[1].length) !==
          parseInt(result.data.data.pairs[0].token0.decimals)
        ) {
          for (
            var i = reserve0[1].length;
            i < parseInt(result.data.data.pairs[0].token0.decimals);
            i++
          ) {
            reserve0[1] += "0";
          }
          result.data.data.pairs[0].reserve0 = reserve0[0] + reserve0[1];
        } else {
          result.data.data.pairs[0].reserve0 =
            result.data.data.pairs[0].reserve0.replace(".", "");
        }
        if (
          parseInt(reserve1[1].length) !==
          parseInt(result.data.data.pairs[0].token1.decimals)
        ) {
          for (
            var i = reserve1[1].length;
            i < parseInt(result.data.data.pairs[0].token1.decimals) + 2;
            i++
          ) {
            reserve1[1] += "0";
          }
          result.data.data.pairs[0].reserve1 = reserve1[0] + reserve1[1];
        } else {
          result.data.data.pairs[0].reserve1 =
            result.data.data.pairs[0].reserve1.replace(".", "");
        }
        response.data = result.data.data;
        response.shuffle = 0;
        response.status = "SUCCESS";
      } else {
          let result = await axios.post(
            "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
            {
              query: `
              {
                pairs(where: 
                  {
                    token0: "${token1}",
                    token1: "${token0}"
                  }) {
                  id
                  token0 {
                    id
                    symbol
                    decimals
                  }
                  token1 {
                    id
                    symbol
                    decimals
                  }
                  reserve0
                  reserve1
                }
              }
            `,
            }
          );
          if (result.data.data.pairs.length > 0) {
            let reserve0 = result.data.data.pairs[0].reserve0.split(".");
            let reserve1 = result.data.data.pairs[0].reserve1.split(".");
            if (
              parseInt(reserve0[1].length) !==
              parseInt(result.data.data.pairs[0].token0.decimals)
            ) {
              for (
                var i = reserve0[1].length;
                i < parseInt(result.data.data.pairs[0].token0.decimals);
                i++
              ) {
                reserve0[1] += "0";
              }
              result.data.data.pairs[0].reserve0 = reserve0[0] + reserve0[1];
            } else {
              result.data.data.pairs[0].reserve0 =
                result.data.data.pairs[0].reserve0.replace(".", "");
            }
            if (
              parseInt(reserve1[1].length) !==
              parseInt(result.data.data.pairs[0].token1.decimals)
            ) {
              for (
                var i = reserve1[1].length;
                i < parseInt(result.data.data.pairs[0].token1.decimals) + 2;
                i++
              ) {
                reserve1[1] += "0";
              }
              result.data.data.pairs[0].reserve1 = reserve1[0] + reserve1[1];
            } else {
              result.data.data.pairs[0].reserve1 =
                result.data.data.pairs[0].reserve1.replace(".", "");
            }
            response.data = result.data.data;
            response.shuffle = 1;
            response.status = "SUCCESS";
          } else {
            response.data = '';
            response.shuffle = 0;
            response.status = "SUCCESS";
          }
        
      }
    
    res.status(statusCode).json(response)
});

      // GET PAIR DETAILS //

router.get('/UNISWAP/pair',async(req,res) => {
    // console.log(req.query,"---ujh")
    let response = {}
    response.data = []
    let statusCode = 200

    let pairAddr =  req.query.pairAddress;
        let result = await axios.post(
          "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
          {
            query: `
            {
              pair(id:"${pairAddr}"){
                id
                token0Price
                token1Price
                reserve0
                reserve1
                token0 {
                  id
                  symbol
                  decimals
                }
                token1 {
                  id
                  symbol
                  decimals
                }
            
                volumeUSD
                reserveUSD
              }
            }
          `,
          }
        );       
        
        let reserve0 = result.data.data.pair.reserve0.split(".");     
        let reserve1 = result.data.data.pair.reserve1.split(".");
        if (
          parseInt(reserve0[1].length) !==
          parseInt(result.data.data.pair.token0.decimals)
        ) {
          
  
          for (var i = reserve0[1].length; i < parseInt(result.data.data.pair.token0.decimals); i++) {
            reserve0[1] += "0";
          }
          result.data.data.pair.reserve0 = reserve0[0]+reserve0[1];
          
        } else {
          result.data.data.pair.reserve0 = result.data.data.pair.reserve0.replace(".", "");
        }
        if (
          parseInt(reserve1[1].length) !==
          parseInt(result.data.data.pair.token1.decimals)
        ) {
          
  
          for (var i = reserve1[1].length; i < parseInt(result.data.data.pair.token1.decimals)+2; i++) {
            reserve1[1] += "0";
          }
          result.data.data.pair.reserve1 = reserve1[0]+reserve1[1];
          
        }  else {
          result.data.data.pair.reserve1 = result.data.data.pair.reserve1.replace(".", "");
        }
          response.data = result.data.data;
          response.status = "SUCCESS";
        
     
      res.status(statusCode).json(response)
});

router.get('/SUSHISWAP/pair',async(req,res) => {
    let response = {}
    response.data = []
    let statusCode = 200
    let pariAddr =  req.query.pairAddress; 
        let result = await axios.post(
          "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
          {
            query: `
            {
              pair(id:"${pariAddr}"){
                id
                token0Price
                token1Price
                reserve0
                reserve1
                volumeUSD
                reserveUSD
                token0 {
                  id
                  symbol
                  decimals
                }
                token1 {
                  id
                  symbol
                  decimals
                }
              }
            }
          `,
          }
        );
        let resevers = await getReserves(result.data.data.pair.id);
          if(resevers.length > 0) {
  
           result.data.data.pair.reserve0 = resevers[0]; 
           result.data.data.pair.reserve1 = resevers[1];
         }

        response.data = result.data.data
        response.status = "SUCCESS";
      
      res.status(statusCode).json(response)
});

  // CHECK PAIR EXISIT OR NOT //

router.post('/checkPair',async(req,res) => {
  let response = {}
  response.data = []
  let statusCode = 200
  let data ;
  if(req.body.id == 1){
    data = await checkUniswapPair(req.body);
  } else if(req.body.id == 2) {
    data = await checkSushiswapPair(req.body);
  } 
  // else if (req.params.id == 3) {
  //   data = await getBalancerPairs();
  // } else if (req.params.id == 4) {
  //   data = await getBancorPairs();
  // } 
  else {
    data = []
  }

  response.data = data
  response.status = "SUCCESS";
  res.status(statusCode).json(response)
});


const getReserves = async (pairId) => {
  const PAIR_ADDR = pairId.toString();

  const PairContractHTTP = new web3http.eth.Contract(
    UniswapV2Pair.abi,
    PAIR_ADDR
  );
  return new Promise(async (relsove,rejects) => {

    const _reserves = await PairContractHTTP.methods.getReserves().call();

    if(_reserves){
      relsove([_reserves.reserve0,_reserves.reserve1])
    } else {
      resolve([])
    }
  })

}


const checkUniswapPair = async (wheres) => {
      let result = await axios.post(
          "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
          {
            query: `
            {
                pairs(where :{
                  token0: "${wheres.token0}",
                  token1: "${wheres.token1}",
                  reserveUSD_gt: "100000", 
                  volumeUSD_gt: "5000"
                }) {
                  id
                  token0 {
                    id
                    symbol
                  }
                  token1 {
                    id
                    symbol
                  }
                }
              }
          `,
          }
        );
        if(result.data.data.pairs.length > 0){
           return result.data.data.pairs;
        } else {
          let result1 = await axios.post(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
            {
              query: `
              {
                  pairs(where :{
                    token1: "${wheres.token0}",
                    token0: "${wheres.token1}",
                    reserveUSD_gt: "100000", 
                    volumeUSD_gt: "5000"
                  }) {
                    id
                    token0 {
                      id
                      symbol
                    }
                    token1 {
                      id
                      symbol
                    }
                  }
                }
            `,
            }
          );
          if (result1.data.data.pairs.length > 0) {
            return result.data.data.pairs;
          } else {
            return [];
          }

        }
              
          
  }
const checkSushiswapPair = async (wheres) => {
 
      let result = await axios.post(
          "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
          {
            query: `
            {
                pairs(where :{
                  token0: "${wheres.token0}",
                  token1: "${wheres.token1}",
                  reserveUSD_gt: "100000", 
                  volumeUSD_gt: "5000"
                }) {
                  id
                  token0 {
                    id
                    symbol
                  }
                  token1 {
                    id
                    symbol
                  }
                }
              }
          `,
          }
        );
        if(result.data.data.pairs.length > 0){
           return result.data.data.pairs;
        } else {
          let result1 = await axios.post(
            "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
            {
              query: `
              {
                  pairs(where :{
                    token1: "${wheres.token0}",
                    token0: "${wheres.token1}",
                    reserveUSD_gt: "100000", 
                    volumeUSD_gt: "5000"
                  }) {
                    id
                    token0 {
                      id
                      symbol
                    }
                    token1 {
                      id
                      symbol
                    }
                  }
                }
            `,
            }
          );
          if (result1.data.data.pairs.length > 0) {
            return result.data.data.pairs;
          } else {
            return [];
          }

        }
              
          
  }



// --- GET ALL PAIRS FROM THE GRAPH API ///
// 1 == UNISWAP 
// 2 == SUSHISWAP 
// 3 == BALANCER
// 4 == BANCOR
router.get('/allPairs/:id',async(req,res) => {
  let response = {}
  response.data = []
  let statusCode = 200
  let data ;
  if(req.params.id == 1){
    data = await getUniswapPairs();
  } else if(req.params.id == 2) {
    data = await getSushiswapPairs();
  } else if (req.params.id == 3) {
    data = await getBalancerPairs();
  } else if (req.params.id == 4) {
    data = await getBancorPairs();
  } 
  else {
    data = []
  }

  response.totalCount = data.length
  response.status = "SUCCESS";
  response.data = data
  res.status(statusCode).json(response)
});


const getUniswapPairs = async () => {
  let skip = 0;
  let take = 1000;
  let data = []
  do {
      let result = await axios.post(
        "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
        {
          query: `
            {
              pairs(first: ${take},skip : ${skip},
                where: {
                  reserveUSD_gt: "100000", 
                  volumeUSD_gt: "5000",
                }, 
                orderBy: reserveUSD, 
                orderDirection: desc) {
                id
                token0 {
                  id
                  symbol
                }
                token1 {
                  id
                  symbol
                }
              }
            }          
          `,
        }
      );
      if (result.data.data.pairs.length > 0) {
        data.push(...result.data.data.pairs)
      }
      skip= skip+1000;
    
  }
  while (data.length >= skip);
  // while (1 > skip);
  return data
}
const getSushiswapPairs = async () => {
  let skip = 0;
  let take = 1000;
  let data = []
  do {
      let result = await axios.post(
        "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
        {
          query: `
            {
              pairs(first: ${take},skip : ${skip},
                where: {
                  reserveUSD_gt: "100000", 
                  volumeUSD_gt: "5000",
                }, 
                orderBy: reserveUSD, 
                orderDirection: desc) {
                id
                token0 {
                  id
                  symbol
                }
                token1 {
                  id
                  symbol
                }
              }
            }          
          `,
        }
      );
      if (result.data.data.pairs.length > 0) {
        data.push(...result.data.data.pairs)
      }
      skip= skip+1000;
    
  }
  while (data.length >= skip);
  // while (1 > skip);
  return data
}
const getBalancerPairs = async () => {
  let skip = 0;
  let take = 1000;
  let data = []
  do {
      let result = await axios.post(
        "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
        {
          query: `
          {
            pools(first: ${take},skip:${skip}, where: {publicSwap: true}) {
              id
              tokens {
                address
                symbol
              }
            }
          }         
          `,
        }
      );
      if (result.data.data.pools.length > 0) {
        data.push(...result.data.data.pools)
      }
      skip= skip+1000;
   
  }
  while (data.length >= skip);
  // while (1 > skip);
  return data
}
const getBancorPairs = () => {
  try {
    var config = {
      method: "get",
      url: "https://api-v2.bancor.network/pools",
      headers: {},
    };
    return new Promise((relsove,rejects) => {

      axios(config)
        .then(function (response) {
          if(response.data.data.length > 0){
            relsove(response.data.data)
          } else {
            relsove([])
          }
        })
    })
  } catch (err) {
    return new Promise((x,y)=>x([]));
  }
};

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
app.use('/', router);
app.listen(5000, () => {
  console.log("Server running on port 5000");
 });