import { connect } from "starknetkit";

import { useAccount } from "../../hooks/useAccount";
import { connect as accountConnect } from "../../network/account";
import { AccountInfo } from "./AccountInfo";
import { isMainnet } from "../../constants/amm";
import { SupportedWalletIds } from "../../types/wallet";
import { onConnect } from "../../network/hooks";
import ReactDOM from "react-dom";
import { BraavosBanner } from "./BraavosBanner";
import { StarknetWindowObject } from "get-starknet-core";
import { debug } from "../../utils/debugger";

import styles from "./button.module.css";

type CustomWallet = {
  id: SupportedWalletIds;
  name: string;
  alt?: string;
  image: string;
  windowPropName: keyof typeof window;
  storeLink: string;
};

const okxWallet: CustomWallet = {
  id: SupportedWalletIds.OKXWallet,
  name: "OKX Wallet",
  alt: "OKX Wallet",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=",
  windowPropName: "starknet_okxwallet",
  storeLink:
    "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
};

const bitgetWallet: CustomWallet = {
  id: SupportedWalletIds.Bitget,
  name: "Bitget Wallet",
  alt: "Bitget Wallet",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAMAAAAKE/YAAAAC8VBMVEUAAACS3/uZ5/rF4v7h/f9K6Pdi0vtTyvqnt/5T1PlH9fakpf/p//88/fXs//5G8vXy//5F8/Zj1vqvuv514PrI7v2J3/o6/PTE7/1A9fbU+/3Y+/1R0vo7/fXh//7G5/3l//6jov6k8fuxs/6ppP6/1f5O6Pfv//7n//+bsv4AAADy//7r//7l//45//RE/vTg//1I/vVB/vRL+vXb//09//RM/vXV/v19/vhQ/vXw+/5z/fc++vVh+feC/fii/fpf9PdQ1Pmxr/6y/vuM/fm8/vun/frB/vyt/vpq9vi3/vtZ9fdRyvq1s/5N4Ph4/vfj9v6tqv7e+f1q/PbK//xS3fhS6fdl+/bX2f6c/fmS/flw6fng7/7f4/66uP5O2fmB8Pla5/jQ//2H/fjT1P6X/fl47vlV/vXLy/5p7fhc+fbHx/5v7/hL5vdR5fhT+fbP0P6T7/p15Pp09PhB9fWL7fp6+vhn8/di8PdG8Pbb3f7F/vyppf586Ppu/feK8/rX+v1W2PlN8vbW7/1Vzvrb8/6D6fpE+vXO+/zj6P5x+PjV9v1Qz/rn8/7m7v7Y4v5X7vfCwv+lo/7R6f3I/Py/vf9H9fbq+P7Q4f5Z0/qt9/ub8PuC9vlU4fiT9/rs/P5t4frQ2v4KGBje6f5+3/pI6/bCxv569Plj4/nY6P7B1P67wP7K5/2gtP2/+vzJ4P7P8v1c7vi2+PzL7/1b3/nJ0/5P7vdm3Ppj6fnEzf7Q9/2zuP6k9vtM7Peb9/qJ3fpf1vq5xv6TyfyO5fpd2/lZ/faG1vrC3P6rs/6k8PuU1fvJ2f6+y/6Xvvyl6Pu2vf633P205vxqeX5Cf32lxv2i2fyW3vuorP6hq/6+5P2wyf2u7fys3/zD6/2gvf2puv0dHiC40P2w1f2n0PyN0PuvwP667f2d0fybx/yi4ftYe3xPn5oufHvW7+5U7uZwm5oQLy3R3N5G29eEnp53zco5WF0qMC+dzM2MzcwsLzAtbGshLA3xAAAAKnRSTlMAIf47Wjuk17BXvH1536di36KDXdSkaIV1cd+/6c/v5s/Pvd/f0+PKk9+fkOCeAAAZMUlEQVR42szVvarqQBSGYS2iJHAQbUTIaXdpceo06cPuYruvIKnSpFQCaayFFCm9BbuAl3a+NWtmPojljj/vGqwfFkudTdo8DDeLdRTHcSqd43i5XCw2YRDMPrJwt/76Rj+2VNlalmXLxeaj5HN4i0LEVKORGkEefoR8tf66FtrYrerUsQmfvbVddDVZc2HJqk7xqBY24eF89p6CqK6VjKFa8ux0xGbv2Hewvdboatkm7hrDCxmreSevWTeXXEFMNRLyw67pJhvR/bp1r6IK1RXN7j6IBjtXM9VvZK/+VNaskY3ozsHWyHa9lE0y1byPK81ctardbb+FHUQkc9mebfPsPM8h98smvDk3WdbIWPbz/nLmUZIkVeLYY/Og7BKjZrJzzz5jGkFLmX4K/Vm/JLsKZKIfVj2I2ubMUEuy7KNlN7JtQdOdYeLNbPqCv4lk0CRfatswAD0UQ3HAFGVZfpdAO7NeyTHFOHfz0HLyZW8dmepLdbkY9CCjaoGbSqTL1o6C/jHmTp7UjdnTLntu16zkxJEVfbJwax6wa1WD3ZOtt30E24BBxqTPW/au2icJnoe3To2gxqNa4Hoiyu773CVoyV5J1ym689PEq6nWvN3v985c6aDWmq16GG7OfDgcQLb1YMuy/Zlg1H3EtiWoUSMPbSY6DTXjeXfbVq1ZNE/kdEODo+NEvLrslU042Z2Dd74pTiSoQJbx5ARisFtnPl3qExI2yCIHGpW+XnJiGdaNunf33//T7MyayQZZxphbr1Y21EjoBk24+UYqm3S6IfdifNzvvzxsPWdH/qfqSsxKtmrthufgh4Forptmkh37LmP7T2odu6YVRXEcJ0OyZWiQdO/YoSERBaGDu7uL01ssOkSQBrI4xMGsb+oWeIQMrsKjvlFo/pwOJdC933PPvfc8S4hX8zvn7h9+nLz4rsP+gNmrW4y4fc/e3WRomglxYjYmXrZns6XKfTYsZgns96oxawL6yszfIYtZFrapresIt659UDN3ZWA/s5vN3SZmvTk5/LNhPRN/0jHN+6aEsutkXlCTN9wUjpXcMQQ268jsunGoOUZqlqav6DlGwZ7c5Glyz+7L1tj9h7q6fCgpu6RuuDGwRUwOVEdzS4uGTO6Z0PMP557zME/mFsiv1y1uR9aVUHMZyevnNWSeqg++Z/3iyT0r+cKKdlUrG+nLn8c38xc15MyNk4dE9VrGsvddf7SeIX+5avmeL0Cz2rS6Vf3y+PnNYCbX2XXmyaCj25N5IcW6KIqTvc2mjrdxISO5vES9lSRzxogad5aVGVqre/nM1MmiPtvr/6CJGaJmF4rGHLUTZj5JMgc3ZNioiReX61LRSwYz43Kebj6u9UwwG5qaKfpSvObeac6dOO/D5IWUzDKDvHT5XzwtptPj5I/dqRVtZn8Z96iJiRPMv3NJn8lYczszD7WcB5GuixDM06ejw8yADe3Jiu6oO8X8E7FLxtazxGwpIFvNksY+f4Rm9mo7DSsadWrPBDZkHmNkpm5mt9Vn+/4RuhiZqLnd9uZOp5NstqZXwVyJm2QBzRiYPE2fZucJx/HVzAFtaiWDFna705nsNvfy3rxXZ68kwBHzmKpassuqkBm4mYbMZrOEsz599Z6NTMSMuA06wdxDLWPmHLJnV2r2U4zUPB0oGDLmRSPxoFuvoaMYbpNJMhN1s4AtFQM5BHEwDzCzkCWLxeJsx3HEg3bk7YOOZlVPks2531Uvp+Y6O2ZQVaPRCK+QGcjBTI72PQ4j180k2UyUzHTVe6vm6B6xA8w+8TYwSxppXzszR7I8I+9nzru9XlfN3VtlS6qKlYpDzSNtejgd1sg3i5vzlC+HS71myO0t9Lfd5vF4HNBdIXeFLF7EIag9mfVVDweQTY355tfRzt/QLUMrmYEM18hJZtTjgCarrkSsuFnIoxhqDuShkQUt+bTjd1JL0du3gTmKnfofZ3YP2lQUhnE8fg0WURz8RgcHcRQVWgmxgrUaHRwiSOsSlCpKQEJoKoiNk0hmp6Zk7ebg5BDcHDp3dHdQUREFcfL/vu+5901yYu6NzznnJoPDz4dzr/HcfGaiXruYWVaah0wz12p3akY2c/VZ9UVVa6bo5fqOjLtwuGeCeFKziYM8IpvYi67VHtaImoPaatbU6/V/VL0viGMzPbsZ8YMHX7/nMZf0cqlELjmbGdwrJJjpmXG/ZmTM1aoVbWhycEzRTo57NnJOMwHLErIMy4qNJwwhMxBbEIeYGHAgk872kUUrOTKL2sk5zaU4Tge+wkStcTLDyPfZz2S5mpo79U7n4KiiI7MX7eQLE5tdzHVFhplTctnMjUYjrVmbdjNosn1k0SaOzRP3fLt0m8lFpgWsLcyeMgnkGmQzB7WR3UzVcdFoxz82aDmX+TZRMrGvTF18L5dLKZiotwx5uOjWckvJbt7cjB4gu+OWHX0BM+jc5jjYWWUmbKanDZmoeYNUA7q6LG43g94cflZP9ZvxMoe3M3n//j/N5i0p0821djmA2RyNjY37G1VDt1rVFqnXmfWEHFW9LXh9a7i5r+ac5gqzwuTCNyOzTOvsdrvdaDdCMHvRgOlZyd1O512n00MdVb3/7Nn4h2j/wzlfz1sYoyi+XAFf4VpmBHGZ0Q5iM1P0OmlpMBMzK3lt8/DgbegtR0+N/D1/Vh9rZNCqebVcUa8XDdmyvl6tJuZuq1tnYH63Kere5trah239z7uoZcj/ZSar/zQbeVU6TqNoE2NOySbuYiY9yZqkf39MGVrFkTmQs82rq5XVJBUmST+5shiQ2ywnY24yEIckPSPGLEX3pObNtQ9rayfdvM2OjywDZMT5zZlpsxBXEnKz2WywRKxmJ4dYzV70mzfb+ndHAAdyVHNOc3G1WAxrlJlhNRdlNlFjpmXcqfkeZBlha3R6plYy6MO+O0wc7YyJzMXRaetfoCjL/oiRCUWHgHVyay6p2YtGLGji+yOYnWyHGupFnMdczBfAem2m4g3MzfWLjHsM0ETJ8d5A7ftjt6HdDFkyqfkmgysfOkanKcOjZDUreW5urmtNYyZ95JCdAb1fxedkndOe5Yzu8YPHmEles2GHUmSmfvmq5ptOvti8SIRMMLfmTOxm0K5+/fpA8i8L5nMyEjNBnJhLmWZo2WkyBsEzDMBSs4jVvNjtMpfemXm215vvJ4P+aOZd6RsUTkKlY5LW/Oj9o0xz6pqxi82ZmWE1PevAPTOjYswSyLClZsQEtPfsZsjENvU+E4cDZxWzgjhHzwEK818RsS0r2MQh66lYyKoGvPBudhbxvBVtZIs99Kb6Xp+EUDNkTelPlnkAe1HXuGjBM2hZ1jKZs1twcdFqBi3m+V4wX1a0sQ/Yljaxk98/puJALv3IMA+Kocjgc4wf6hCZKBnx0hLiBcyz1Owb+rqJX716elTRVrKbHz1OyWQrp1mpcVztf4jpYsiaxbnF7uIi5CXIbI7eLGRVa82Yg/qVbOpdSmYmZLSJmd/uX8aZf5lkOFtj8zkVO7mLGLJExAQz5GuYL1/2niU7QR9Sq5NvGFjIgs5o2sVGkXnv5/gzs617LmbSMgMyaMi2NdgckK8Z+fqVK1cwX70q5pdyJ06l4htiTtBEzJWvGXs65fYln9r3BUlqRp3UDPka5MvXQav5qZpfyp14PCVzJAvZxGYu88M96+nh3EnUaGMzYjdDxgz5zaD5pdyJwWtmI9tZUNnS/pWh9s3pyVSnZhdDJr6dzWx7g63xFDRmwn0oaGI1c4ycklfM3M5U442TpXaxmyGnPbvZezb03W2FXTc8lywlEwcyydohSWsTqcFavOXYHNBX3Xx3enpnYZ+LA3mFBLKgG2QrS83OjJJH7befk4mSid+DtqHJtKCPDHQsR8eEoiE3ZGg2stQKmFSN2MxxzYa2nq+a+ZbUfHea7CnsV3KiHjgcVHOzIf9VzqNWg37KWMqhVnFE9prNrPcgaDOT04X9/l4BrQVwuZEknKJkqZdGJUvtYt8Zkth8y83n9xam4PpLEEkNMoev/WTQ+dULE6jHkUebn0+fP1aYMq6TV2rEWyZCzlZ/40fDQpQM9SfIlpTsNQczaMxe9PmjhVOJ+Im8s3loZCbu+3jt8JXjqtZ6K1MNe2J1AHvNI8237pJgPnO08NbM6eu8/hcgcmBMkhO2TLV1thA+mIwcahc7uc98i7xMzeREIZBFXTNzeMkEuRoiR9z51D20HqNnqQfIXjNmEvVM02cK2rHX7OaY3G3V83Q9bxfP7ww15OgGFLMXPWAG/TbdGbyeZrg5qJfl7QfH8jLqWeqf88PJo453BmTvWYt2M+i/zdxfaJVlHMDxczwRi8WIypCELCr64wZdCIGXhRRBMKULoSkRXgjdWNBNKQhjkgyTWqHUxTKH4PxLsgvbxZiC1rSp4dTN6dp06oKQiP7d9f39fs/z/s7x0b3vdFbf5zlnXX749Zyje9+3TPymiDUFr6sma+++j5grxjnqr//CmXb9+Ry1ilMy5nTOoAM5iFmIWes22K1pzIEcb5z+nKN+1bNPWBF1aoacnmdDN5VcDPi9+EjLWxsswI5WcxH1F7Jry1PDTcaM2NBOVnNT6Su08XmndWxtwzoVZ2ZNxQXV/Pt+9eWZqWvJZGQ3k5kfKz38ZnioDPJ7Rnaz7MNOjnf08tTy2yivqgqo8Ro5NVOVuekB0ORP76k5dBgxZllz3p3z5ZxALqDGbKu6PHVCTs2Gfrz0MNgoxtwFWcEbDhNmEZOKBzEXU38jv4++zHoNLa9C6kCexgyZ5pfu5WFUM3chxtzF6gtowmxznjOI+vtBxOe/P38+R/0naDarujx1Qk7nTI0NoKUuIVuIMYfmxCAPDmJmCTpfvYReW4J0Jmonuxmym7WG0oNmZpFOua/v8Ia+YGYZWZaqB8+LuZB675KkHPWPJnZyaqb7S49ARhxC3NV3OJDPAM7MGmTQVES9d+8SNvSZqJ2MWbvR3Nh4T+k+qBlZlgYc85kzZ4KZbeZMfeX8lXy19QotWcKL9Uq+GnJynN0MulIq15jNywLMnsOamjM1NTU4FQZNgUx56lf2sjR+xPLOdUJ2tJIFXcrImENn+hCTqCGTmU8Nnh89f0rWqSuw89UfutX7Lec/LwlkSsiYiWt5D3d1Hek6coRXlZmtTZ0BbJMeZaFGDBkxFVDfrBz1z3DNrOpAdvPjoO/FDLnvyJE+WQO2jBzVNDqKehQwoT5VUP1Z6MPPPmQXU/+i4lD1mA3dAPoRnbIk7r4gNvXQ1JCJp1SsZidfuHLhwoUCau8NW29Mr76uZrabg1q7H/R9R7wBWZqoh84MDQl7CDXVqIevDAf19R+n6/pHGbi636f9BjFvejasSoky8uVq8tAAYsJsZEcPnxoeBg04dCBrP32rfVQbFw/5ndrEuZN2cWKmsqAfDmLWZdQx1EyaRlnRfJKFGjJmtohZkXwAMuiMfQP9bfYbrJwz/WtqbozmhY0PlKR7VSwNXB5gS1chx6L55OhJFVtGNrVPWcxx1MLmvcos8Z737ZGQlR3VDYp+BDLbCuaBqzR0NZgnRicmMDNmOnXS1budDDqwvaC3y8oBnWv+45f0ZDi5ceE9ii5DDeBDA2zxBvMl1oSaJzA7WdG7h3df2E0HdpuZFN2Ou729HS5v6+lFCbaVa4acjNnNCyslLUMfGjjEjupLVzGbuoo9LIv2DWNmHVB1x4GO/a1CRpu1Xl7f6voIue58M9hkzk5eyJHW7oV7+ZB1VVZUaxOXAEOeOGkdPTl8dPiomDXIHR1x0q2trcJ29fqqIM/EXDNlZzcE9COihR3d165dvSZktqNRB/NRaXjfvn3D+wK7g1o7Wgl2e6ura8nFzYjT08wijrSFNHTt0DXCfFrItaMeh9wN+SSDPoo4kAHTfsxk5ra2NkcvC+pFi9YvKmRG7FVN2SpHdF2N2Tp9+tLpKvP4BObx7jhp1IR76+4O2NmoqQ0zW1rftgxzRi5irhU3OTmM+hm4fj5+YEFmq5hRq3rk0sjIxAhmFuzu7m4zG5lhb8Vr6GBuYxPw9mWYswqZU3Ekk58ODTDrGkvJbA31CGpBW92oa9hbSdk7O3buVDM7qJfJRhvpueZqcC05PR1U9wOpmi3koBayND5i5nEhC/pYNXkrZMygqcXECvYKml3tOZgaSl5FyNq1ixcvIg5mtobZ1biPHT12bN+xfVsjGzLmnTtbBC2rWd3NMzKnU/aj0einw4OrXfwBNBkaMhuyq9WMmhBbHA2rZTtg24iblzXzxntxc/S6mOVk/ZPFq3e1mtljp09Pwrb6R8b7x8ePj3cfVzZkVW8z9ebNQt7Obtneqmp1I4Ysu/l6AbPP2Mm8LD8dXrlKbOrTqCcnJ0cmzQwZNGSpR9XbyMhRTS2h5pZmduzH6c1/Y47c9GBkbv8Y+kdxD+rIHrs4NjY2ORnZoPv7jx8fPw77IOieHlOTqimgmbWrC5sbbyo2the+pL2KoPewzcwCDVvV/dJ4/3E6ePBg98EeKYwatZpRuxkyrzswkzmd7R9Drw4waroIXMyZun+SSRNqYZOYeyCLejloCbGqrU0tzZs2NW+audnmm/3w/GPoPaTgoBaxqiP7hJpVbWYyNOblQb3C1BtNjZlXYbOT2Wk26KTnXD3GZtQk5hOTJzBrhs7YqzBvWx7MK9S8kVF/bEGm4mafrX/PJYNORu19NzbGFnOvqGHv6u/fJaPekaHXbFsFehvoDzZ/gFnavpFAs/EWNgM0p67ig/ZRQ9aXsHvZmGXUsIHv2LHD0KtRg16FGTVoIa9YsVHYH4eKmF3sXFfnDFpHfe7cHhZiWcS8e+mEtIvEfNzYq3vWrFmzigS9GTVoEnNLVOeaf/qlk1zs8IKDpjrEdPbcnrOqpt7vxlQd2TskMa9eDbpHZi2TphXKxkxBnWv+tVM0vCXggoOmCmKd9VmGHYLss47qd95RtI06U2tmtnLNgEW6OAesVaIyHbWGWgpqcxv6k4jWUUc0KdrVxcyLhcsb4NwaSreq/JyizzJqzFGt2ahhfyJoRu1qRZOSQUvFzExad36d5dItq4dMYdLsl1hx1CtXKvoTR5OjUUtK3ljMrLtQ95em6YlgDmzp9d5edu/KlTrqz3NGDZqKno2UXfxT6JXPnfuUBdhi0uZGTaBRY3Z1NdrV+WYjF6xcmrb6T0HrsZaWLpUD8tLrr+usCbSrk1HPxKyTLibncOT0xKfa2rVrMaN+iURtaMygUaejdnURM2j2nR0Or4z4HOssatiobda0UhI1+aiDWsiCLng2bNGdfXP4AametagpUdd+Fn3SVGzO8XTc+eFwNWZamqgx0y1GzawLmouK6VlTFT3WpGZXZ8eabnaqi5r9TOf2QNH/Yd5Tho5qR7s6QZu6oNkmPYtmqkCWMKN29i1PNRn698JzLsiulApXH9HCdjSlXyA+6qJm71bsxrj5EN6WGjSZmQSdqo2db95SDWbdDGxeNxev7gZ1NmlXJ+hc8xbM7KpqsLZ80v7FUVzt6PSz6Gg/IL//NG1/Z+ZOH7WxjVmLp4bSjHvC1QVONSV/Q/XfFWmLJlafNvyFnUHsk46/nnMR7PbUjna1oikZNTlaq0FvWqxsyJ0WZDY8FbO1+A/PlEu3pwbtakenp9rQqdrMgb1pi8y4083yhje5HCY9jvm2qnN0jbr2b3vT/AoDmjKzBV3Njfam4KSG0m1X72rMS6cdNTnaLoGwHY3axJhRq3gx5oWzZnb12vRrr3bUhvZR20WyeOHG0GHWMcxBzb5ZfD/fmdrRPmlydDLqzYaOlyNbIPuslcwW8c3J8lzmHVZ5CrWjXV2LJrmy5+rtoIXdImwRN7OzSbOaOpswp+KmxyqlO678lKLXJucjHbWiN4NWNWy/xq7s5i0sRQNm+72hqtuefG3MRvXT/AGzA7Wjw5VfbSdk0kmjxqyBbrJpZ0wyvuxnMc+a+uZf1Y6mbYZebmZSNGy7bWRqG7Y6t7g29pgf51k4Io5WtV8DQQ26Z/WaHg61thV1YNfeows16drCWxJHYzard7Wjd4EmLkfCXiN3YfSGBvcVIRu6FbWa2R5ezMZ+gc2SHz7mWRt2Ldqv7NlF1J4eY9tNOj8gLa3b2/TOc5vdwQ2r+YWmZTDBsq3HK6XZr77qfPRGdbzK7ve7YKM2tA1bxHqTHy3bQrmMlcVpviuV6yKai2SKRm1oZ2NWdYeiW3e2arBrH6fAG+BWQ7l0t6o86eiqWwOZ2W+Yo8ZMasYb1J6RFy1iL5pfKd3NHoKdol3NswmgpQ6KaDJzxl4ki+Tt0XtKdznYoCneOurnjlc1Okxan7eBHc2o21k8gwVZXia++2RnO9pv43ZjpvjADWrY/hRZfFQPd0jI8+862dl1UQ16h6kdjVrNZOb9bkZdFWf536xc9+SNo+bpFTWjpvCYIfE0p6x2czv7sfv/RbKPG7Tf5+8WtLCzxwxhA0ettbOtMORy6T+p/FBdLVrMR33SvPTh2aiWp5O/lebP+2/EPu+nFd1t+ROdiDEfYEU1aHp07j3l0n9fBbijpYim6ifCAc/7P4BdPm/u06DNjDqSQWsL5s77X0w4rVJ5aN7cuU8/vWABo+Y59gULFsyfi3aWuf8ADHnSl6eWnZwAAAAASUVORK5CYII=",
  windowPropName: "starknet_bitkeep",
  storeLink:
    "https://chromewebstore.google.com/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak",
};

const addBanner = () => {
  const shadowParent = document.getElementById("starknetkit-modal-container");
  if (!shadowParent) {
    return;
  }

  const list = shadowParent.shadowRoot!.querySelector("ul");
  const overlay = shadowParent.shadowRoot!.querySelector("div");

  if (!list || !overlay) {
    return;
  }

  const walletElems = Array.from(list.childNodes) as HTMLElement[];

  const braavosWalletElem = walletElems.find((c) => {
    if (c && c.querySelector) {
      const p = c.querySelector("p");
      if (
        p &&
        (p.innerText === "Braavos" || p.innerText === "Install Braavos")
      ) {
        return true;
      }
    }
    return false;
  });

  const banner = document.createElement("div");
  banner.style.width = "100%";
  banner.style.background =
    "linear-gradient(94deg, #1A4079 -1.25%, #0F1242 101.88%)";
  banner.style.borderRadius = "6px";

  ReactDOM.render(<BraavosBanner />, banner);

  braavosWalletElem?.insertAdjacentElement("afterend", banner);
};

// this is a hack that adds one extra wallet
// to "starknetkit" modal with custom callback
const addCustomWallet = (wallet: CustomWallet) => {
  // starknet wallet object or undefined
  const walletWindowObject = window[wallet.windowPropName] as
    | StarknetWindowObject
    | undefined;

  const shadowParent = document.getElementById("starknetkit-modal-container");

  if (!shadowParent) {
    return;
  }

  const list = shadowParent.shadowRoot!.querySelector("ul");
  const overlay = shadowParent.shadowRoot!.querySelector("div");

  if (!list || !overlay) {
    return;
  }

  // create a copy of the first wallet on the list
  const customWallet = list.children[0].cloneNode(true);
  const paragraphs = (customWallet as HTMLElement).getElementsByTagName("p");
  const img =
    ((customWallet as HTMLElement).querySelector("img") as HTMLImageElement) ||
    undefined;

  if (!paragraphs || !paragraphs[0] || !img) {
    return;
  }

  Array.from(paragraphs).map((p) => (p.innerText = ""));
  paragraphs[0].innerText = wallet.name;
  img.alt = wallet.alt || "";
  img.src = wallet.image;

  // append custom wallet to the bottom of the list
  list.appendChild(customWallet);

  customWallet.addEventListener("click", () => {
    // user does not have wallet, open extension store
    if (!walletWindowObject) {
      if (wallet.id === SupportedWalletIds.OKXWallet) {
        window.open(wallet.storeLink);
      }

      return;
    }
    accountConnect(walletWindowObject);
    // simulate overlay click to close the modal
    overlay.click();
  });
};

export const openWalletConnectDialog = async () => {
  connect({
    modalMode: "alwaysAsk",
    dappName: "Carmine Options AMM",
    // app currently has only dark theme
    modalTheme: "dark",
  })
    .then((modalResult) => {
      const wallet = modalResult.wallet as
        | StarknetWindowObject
        | undefined
        | null;
      if (wallet) {
        accountConnect(wallet);
      }
    })
    .catch((error: any) => {
      debug("FAILED CONNECTING WALLET", error);
    });

  // OKX Wallet currently supports only Mainnet
  if (isMainnet) {
    // call inside timeout to make sure modal is present in the DOM
    setTimeout(() => addCustomWallet(okxWallet), 1);
    setTimeout(() => addCustomWallet(bitgetWallet), 1);
    // add braavos banner
    setTimeout(addBanner, 1);
  }
};

export const WalletButton = () => {
  const account = useAccount();

  if (account) {
    onConnect(account);

    // wallet connected
    return <AccountInfo />;
  }

  console.log("WWWWTTTTTFFFFFF", styles);

  return (
    <button
      className={`primary active ${styles.custom}`}
      onClick={openWalletConnectDialog}
    >
      Connect Wallet
    </button>
  );
};
