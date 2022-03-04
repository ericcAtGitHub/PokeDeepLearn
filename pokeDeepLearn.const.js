const IS_DEV = false
const devLog = (toBeLogged) => {
    if (IS_DEV) {
        console.log(toBeLogged)
    }
}

const IS_DOWNLOAD_MODEL_AFTER_TRAINING = IS_DEV
const PRE_TRAINED_MODEL_PATH = 'pretrainedModel/my-trained-model-1646312310444.json'

const HIGH_PREDICT_THRESHOLD = 0.49

const IMAGE_PROCESS_H = 80 //64
const IMAGE_PROCESS_W = 80 //64

const HYPER_PARAM_OPTS = [
    {
        noOfXsPerBatch: 8,
        noOfEpoch: 10,
        desc: 'Batch size = 8, Epoch = 10 (proof of concept only)',
        value: 'low'
    },
    {
        noOfXsPerBatch: 64, // 80
        noOfEpoch: 60,
        desc: 'Batch size = 64, Epoch = 60',
        value: 'high'
    }
]

const HYPER_PARAM_FOR_EXTRA_TRAIN = {
    noOfXsPerBatch: 64,
    noOfEpoch: 10
}

const NO_OF_BATCHES_PER_EPOCH = 60 //50// 7
const NO_OF_VAL_BATCHES_PER_EPOCH = 4

const MODEL_CAPACITY = 2

const DEMO_POKE_NO_OPTS = [
    {
        desc: 'Particular 6',
        pokeNos: [25, 1, 4, 7, 12, 17],
        optValue: 'goodOld6'
    },
    {
        desc: 'Classic 151',
        pokeNos: Array.from(Array(152).keys()).slice(1),
        optValue: 'classic151'
    },
    {
        desc: 'Random pick',
        randomLength: 6,
        optValue: 'randomPick'
    },
]

const DEMO_POKE_NOS = Array.from(Array(152).keys()).slice(1) // [1, 2, 3, 14, 15, 16, 27, 28, 29, 40, 41, 42, 53, 54, 55, 66, 67, 68, 79, 80]

const POKE_TYPE_OTHERS_LABEL = 'others'
const POKE_TYPES_SIMP = [
    "flying",
    "bug",
    "rock",
    "fire",
    "grass",
    "electric",
    "psychic",
    "water",
    "normal",
    "poison",
    "ground",
    POKE_TYPE_OTHERS_LABEL
]

const POKE_TYPES_REF = POKE_TYPES_SIMP // POKE_TYPES

const ALL_POKE_TYPES = [
    "normal",
    "fighting",
    "flying",
    "poison",
    "ground",
    "rock",
    "bug",
    "ghost",
    "steel",
    "fire",
    "water",
    "grass",
    "electric",
    "psychic",
    "ice",
    "dragon",
    "dark",
    "fairy"
]

const VAL_DATA = [
    /*
    {
        basePath: 'sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/female/',
        maxPokeNo: 678
    },*/
    {
        basePath: "sprites/pokemon/other/dream-world/",
        maxPokeNo: 251,
        ext: "svg",
        desc: 'Other, Dream World'
    },
]

const DEMO_DATA = [
    /*
    {
        basePath: 'sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/',
        maxPokeNo: 678,
        desc: 'Generation 7, Ultra Sun / Ultra Moon',
        optValue: 'gen7'
    },*/
    {
        basePath: "sprites/pokemon/other/home/",
        maxPokeNo: 898,
        desc: 'Other, Home',
        optValue: 'home'
    },
    {
        basePath: "sprites/pokemon/other/dream-world/",
        maxPokeNo: 649,
        ext: "svg",
        desc: 'Other, Dream World',
        optValue: 'dreamWorld'
    },
    {
        basePath: "sprites/pokemon/other/official-artwork/",
        maxPokeNo: 649,
        desc: 'Other, Official Artwork',
        optValue: 'officialArtwork'
    },
]

const TRAIN_DATA = [
    /*{
        basePath: 'sprites/pokemon/versions/generation-ii/gold/',
        maxPokeNo: 251
    },
    {
        basePath: 'sprites/pokemon/versions/generation-ii/silver/',
        maxPokeNo: 251
    },
    {
        basePath: 'sprites/pokemon/versions/generation-ii/crystal/',
        maxPokeNo: 251
    },*//*
    {
        basePath: 'sprites/pokemon/versions/generation-iii/emerald/',
        maxPokeNo: 386
    },*/
    {
        basePath: 'sprites/pokemon/versions/generation-iii/firered-leafgreen/',
        maxPokeNo: 151,
        desc: 'Generation 3, Fire Red / Leaf Green'
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iii/firered-leafgreen/back/',
        maxPokeNo: 151,
        desc: 'Generation 3, Fire Red / Leaf Green (Back)'
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iii/ruby-sapphire/',
        maxPokeNo: 251, // 386,
        desc: 'Generation 3, Ruby / Sapphire'
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iii/ruby-sapphire/back/',
        maxPokeNo: 251, //  386,
        desc: 'Generation 3, Ruby / Sapphire (Back)'
    },/*
    {
        basePath: 'sprites/pokemon/versions/generation-iv/diamond-pearl/',
        maxPokeNo: 493
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/diamond-pearl/back/',
        maxPokeNo: 493
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/diamond-pearl/female/',
        maxPokeNo: 473
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/diamond-pearl/back/female/',
        maxPokeNo: 464
    },*/
    {
        basePath: 'sprites/pokemon/versions/generation-iv/heartgold-soulsilver/',
        maxPokeNo: 251, // 493,
        desc: 'Generation 4, Heart Gold / Soul Silver'
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/',
        maxPokeNo: 251, // 493,
        desc: 'Generation 4, HeartGold / SoulSilver (Back)'
    },/*
    {
        basePath: 'sprites/pokemon/versions/generation-iv/heartgold-soulsilver/female/',
        maxPokeNo: 473
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/female/',
        maxPokeNo: 465
    },*/
    {
        basePath: 'sprites/pokemon/versions/generation-iv/platinum/',
        maxPokeNo: 251, // 493,
        desc: 'Generation 4, Platinum'
    },/*
    {
        basePath: 'sprites/pokemon/versions/generation-iv/platinum/back/',
        maxPokeNo: 493
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/platinum/female/',
        maxPokeNo: 473
    },
    {
        basePath: 'sprites/pokemon/versions/generation-iv/platinum/back/female/',
        maxPokeNo: 465
    },*/
    {
        basePath: 'sprites/pokemon/versions/generation-v/black-white/',
        maxPokeNo: 251, // 898,
        desc: 'Generation 5, Black / White'
    },
    {
        basePath: 'sprites/pokemon/versions/generation-v/black-white/back/',
        maxPokeNo: 251, // 898,
        desc: 'Generation 5, Black / White (Back)'
    },/*
    {
        basePath: 'sprites/pokemon/versions/generation-v/black-white/female/',
        maxPokeNo: 876
    },
    {
        basePath: 'sprites/pokemon/versions/generation-v/black-white/back/female/',
        maxPokeNo: 876
    },*//*
    {
        basePath: 'sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/',
        maxPokeNo: 721,
        desc: 'Generation 6, Omega Ruby / Alpha Sapphire'
    },
    {
        basePath: 'sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/female/',
        maxPokeNo: 678
    },*/
    {
        basePath: 'sprites/pokemon/versions/generation-vi/x-y/',
        maxPokeNo: 251, // 721,
        desc: 'Generation 6, X / Y'
    },/*
    {
        basePath: 'sprites/pokemon/versions/generation-vi/x-y/female/',
        maxPokeNo: 678
    },*/
    {
        basePath: 'sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/',
        desc: 'Generation 7, Ultra Sun / Ultra Moon',
        maxPokeNo: 251 //807
    },
]