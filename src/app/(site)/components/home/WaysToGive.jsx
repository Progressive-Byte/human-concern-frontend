import React from 'react'

const WaysToGive = () => {
  const cards = [
    {
      id: 'zakat',
      title: 'Zakat',
      description: 'Obligatory charity for eligible Muslims. Pay your Zakat to purify your wealth.',
      img: '/images/zakat.png',
      layout: 'tall-left',
    },
    {
      id: 'sadaqah',
      title: 'Sadaqah',
      description: 'Voluntary charity that can be given at any time to aid those in need.',
      img: '/images/sadaqah.png',
      layout: 'normal',
    },
    {
      id: 'emergency',
      title: 'Emergency Relief',
      description: 'Rapid responses and aid to disaster areas to help communities recover.',
      img: '/images/relief.png',
      layout: 'normal',
    },
    {
      id: 'water',
      title: 'Water Aid',
      description: 'Build sustainable wells and systems to provide clean, safe water for entire villages.',
      img: '/images/water-aid.png',
      layout: 'normal',
    },
    {
      id: 'food',
      title: 'Food Aid',
      description: 'Deliver life-saving meals and nutrition packs to families facing hunger and crisis.',
      img: '/images/food-aid.png',
      layout: 'tall-right',
    },
    {
      id: 'child',
      title: 'Child Sponsorship',
      description: 'Provide education, healthcare, and daily essentials to transform an orphan\'s life.',
      img: '/images/child-sponsorship.png',
      layout: 'wide-bottom',
    },
  ]

  return (
    <section className="py-20 bg-[#F6F6F6]" id="ways-to-give">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-[28px] font-bold text-[#1A1A1A] m-0 tracking-tight">
            Ways to Give
          </h2>
          <p className="text-[15px] font-normal text-[#737373] mt-3 mb-0 leading-relaxed">
            Multiple donation types to fulfill your religious <br className="hidden sm:block" />
            obligations and charitable aspirations.
          </p>
        </div>

        {/* Bento Masonry Grid */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto',
          }}
        >
          {/* ZAKAT — tall, col 1, row 1–2 */}
          <div
            className="bg-white rounded-[20px] overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
            style={{ gridColumn: '1', gridRow: '1 / 3' }}
          >
            <div className="p-6">
              <h4 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1.5 tracking-tight">Zakat</h4>
              <p className="text-[13px] text-[#737373] leading-relaxed m-0">
                Obligatory charity for eligible Muslims. Pay your Zakat to purify your wealth.
              </p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end pb-0 min-h-[260px]">
              <img src="/images/zakat.png" alt="Zakat" className="w-[80%] object-contain" />
            </div>
          </div>

          {/* SADAQAH — col 2, row 1 */}
          <div
            className="bg-white rounded-[20px] overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
            style={{ gridColumn: '2', gridRow: '1' }}
          >
            <div className="p-6">
              <h4 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1.5 tracking-tight">Sadaqah</h4>
              <p className="text-[13px] text-[#737373] leading-relaxed m-0">
                Voluntary charity that can be given at any time to aid those in need.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center pb-4 min-h-[110px]">
              <img src="/images/sadaqah.png" alt="Sadaqah" className="w-[70px] object-contain" />
            </div>
          </div>

          {/* EMERGENCY RELIEF — col 3, row 1 */}
          <div
            className="bg-white rounded-[20px] overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
            style={{ gridColumn: '3', gridRow: '1' }}
          >
            <div className="p-6">
              <h4 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1.5 tracking-tight">Emergency Relief</h4>
              <p className="text-[13px] text-[#737373] leading-relaxed m-0">
                Rapid responses and aid to disaster areas to help communities recover.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center pb-4 min-h-[110px]">
              <img src="/images/relief.png" alt="Emergency Relief" className="w-[80px] object-contain" />
            </div>
          </div>

          {/* WATER AID — col 2, row 2 */}
          <div
            className="bg-white rounded-[20px] overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
            style={{ gridColumn: '2', gridRow: '2' }}
          >
            <div className="p-6">
              <h4 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1.5 tracking-tight">Water Aid</h4>
              <p className="text-[13px] text-[#737373] leading-relaxed m-0">
                Build sustainable wells and systems to provide clean, safe water for entire villages.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center pb-4 min-h-[110px]">
              <img src="/images/water-aid.png" alt="Water Aid" className="w-[70px] object-contain" />
            </div>
          </div>

          {/* FOOD AID — tall, col 3, row 2–3 */}
          <div
            className="bg-white rounded-[20px] overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-200"
            style={{ gridColumn: '3', gridRow: '2 / 4' }}
          >
            <div className="p-6">
              <h4 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1.5 tracking-tight">Food Aid</h4>
              <p className="text-[13px] text-[#737373] leading-relaxed m-0">
                Deliver life-saving meals and nutrition packs to families facing hunger and crisis.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[260px]">
              <img src="/images/food-aid.png" alt="Food Aid" className="w-[75%] object-contain" />
            </div>
          </div>

          {/* CHILD SPONSORSHIP — wide, col 1–2, row 3 */}
          <div
            className="bg-white rounded-[20px] overflow-hidden flex flex-row items-center hover:-translate-y-1 transition-all duration-200"
            style={{ gridColumn: '1 / 3', gridRow: '3' }}
          >
            <div className="p-7 flex-1">
              <h4 className="text-[17px] font-bold text-[#1A1A1A] m-0 mb-1.5 tracking-tight">Child Sponsorship</h4>
              <p className="text-[13px] text-[#737373] leading-relaxed m-0">
                Provide education, healthcare, and daily essentials to transform an orphan's life.
              </p>
            </div>
            <div className="w-[190px] flex items-end justify-end pr-4 pt-4">
              <img src="/images/child-sponsorship.png" alt="Child Sponsorship" className="w-full object-contain" />
            </div>
          </div>
        </div>

        {/* Responsive styles via Tailwind breakpoints are handled via CSS-in-JS below */}
        <style>{`
          @media (max-width: 700px) {
            #ways-to-give .bento-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 480px) {
            #ways-to-give .bento-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

      </div>
    </section>
  )
}

export default WaysToGive