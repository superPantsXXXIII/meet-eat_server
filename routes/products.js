const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const url = "https://msbit-exam-products-store.firebaseio.com/deliveryProducts/products.json"
        const { data } = await axios.get(url)
        let data_ar = data.filter(item => item.status == 1)
        const fedex_ar =[];
        const dhl_ar =[];
        const ups_ar =[];
        data_ar.forEach(item => {
            if(item.type == 1){
                fedex_ar.push({
                    id:item.fedex.id,
                    name:item.fedex.name,
                    description:item.fedex.description,
                    thumbnailUrl:item.fedex.thumbnailUrl
                })
            }
            else if(item.type == 3){
                dhl_ar.push({
                    id:item.id,
                    name:item.name,
                    description:item.description,
                    thumbnailUrl:item.thumbnailUrl
                })
            }
            else if (item.type == 2){
                item.ups.forEach(element =>{
                    ups_ar.push({
                        id:element.id,
                        name:element.name,
                        description:element.description,
                        thumbnailUrl:element.thumbnailUrl
                    })
                })
            }
        });
        res.json([...fedex_ar,...dhl_ar,...ups_ar]);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

module.exports = router;