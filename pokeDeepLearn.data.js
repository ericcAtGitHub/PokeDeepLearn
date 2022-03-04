class PokeData {

    pokeTypeDict = {}

    constructor() {
        this.GetTrainData = this.GetTrainData.bind(this)
        this.GetValData = this.GetValData.bind(this)
        this.GetPokeTypeCode = this.GetPokeTypeCode.bind(this)
    }

    // prepare the dictionary of Pokemon and their types
    async Init() {
        await Promise.all(ALL_POKE_TYPES.map(async (t) => {

             // these files are obtained from PokeApi (file name renamed)
            const pokeTypeDictUrl = `pokeTypeDict/${t}.json`

            const response = await fetch(pokeTypeDictUrl)
            const data = await response.json()
            this.pokeTypeDict[t] = data
            //console.log([t, data.pokemon.length])
            //console.log([t, data.pokemon.filter((typePokemon)=>typePokemon.slot ===1).length])
        }))
        //console.log(Object.keys(this.pokeTypeDict))
    }

    // Given a Pokemon's no, produce a code of the Pokemon types for supervised learning. 
    // The output is a 0-1 vector .
    GetPokeTypeCode = (pokeNo) => {
        
        return POKE_TYPES_REF.map((t) => {

            if (t !== POKE_TYPE_OTHERS_LABEL) {
                return this.isInPokeTypeDict(pokeNo, t) ? 1 : 0
            } else {
                return ALL_POKE_TYPES.some((t) => !POKE_TYPES_REF.includes(t) &&
                    this.isInPokeTypeDict(pokeNo, t))  ? 1 : 0
            }
        })
    }

    // check a Pokemon's type using the specific structure of PokeApi's data
    isInPokeTypeDict = (pokeNo, type) => {
        return this.pokeTypeDict[type].pokemon.some((typePokemon) =>
            typePokemon.pokemon.url.includes(`/${pokeNo}/`))
    }

    async *GetTrainData() {
        for (const dataSource of TRAIN_DATA) {
            for (let i = 1; i <= dataSource.maxPokeNo; i++) {
                try {
                    yield (await this.GetInputTensorFromDataSource(dataSource, i))
                } catch (e) {
                    //console.log(e)
                    console.log('img cannot be loaded; skip this one')
                    continue
                }
            }
        }
    }

    async *GetValData() {
        for (const dataSource of VAL_DATA) {
            for (let i = 1; i <= dataSource.maxPokeNo; i++) {
                try {
                    yield (await this.GetInputTensorFromDataSource(dataSource, i))
                } catch (e) {
                    //console.log(e)
                    console.log('img cannot be loaded; skip this one')
                    continue
                }
            }
        }
    }

    GetInputTensorFromImg(imgEle) {
        return tf.tidy(() => {
            let imgTensor = tf.browser.fromPixels(imgEle).asType('float32')
            imgTensor = tf.image.resizeBilinear(imgTensor, [IMAGE_PROCESS_H, IMAGE_PROCESS_W])
            //imgTensor = imgTensor.div(tf.scalar(127)).sub(tf.scalar(1))
            imgTensor = imgTensor.div(tf.scalar(255))
            return imgTensor
        })
    }

    async GetInputTensorFromDataSource(dataSource, pokeNo) {

        const ext = dataSource.ext ?? "png"

        const spriteUrl = `${dataSource.basePath}${pokeNo}.${ext}`

        let img = new Image()

        const imgRequest = new Promise((resolve, reject) => {
            img.crossOrigin = ''
            img.onload = () => {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;
                resolve(this.GetInputTensorFromImg(img))
            }
            img.onerror = () => {
                reject('error')
            }

            // 'http://localhost/pokeDeepLearn/sprites/pokemon/versions/generation-iv/diamond-pearl/female/1.png'
            img.src = spriteUrl
        })

        const imgResponse = await imgRequest
        img = null

        const pokeTypeOneHot = this.GetPokeTypeCode(pokeNo)
        //console.log(pokeTypeOneHot)
        const pokeTypeOneHotTensor = tf.tensor1d(pokeTypeOneHot, 'int32')

        return ({ xs: imgResponse, ys: pokeTypeOneHotTensor })
    }
}
