// Local car image registry — bundled JPGs in assets/cars/

export const CAR_IMAGES: Partial<Record<string, number>> = {
  // Mass — economy (10 cars)
  'vw-golv':         require('../../assets/cars/vw-golv.jpg'),
  'renolt-logon':    require('../../assets/cars/renolt-logon.jpg'),
  'alfo-tonnle':     require('../../assets/cars/alfo-tonnle.jpg'),
  'toyoda-corla':    require('../../assets/cars/toyoda-corla.jpg'),
  'hondo-civica':    require('../../assets/cars/hondo-civica.jpg'),
  'nezzan-altimo':   require('../../assets/cars/nezzan-altimo.jpg'),
  'masda-3sx':       require('../../assets/cars/masda-3sx.jpg'),
  'hyandai-elontra': require('../../assets/cars/hyandai-elontra.jpg'),
  'chevrolat-cruzo': require('../../assets/cars/chevrolat-cruzo.jpg'),
  'forde-fucos':     require('../../assets/cars/forde-fucos.jpg'),

  // Luxury — sedans, SUVs & coupes (10 cars)
  'auddi-a6':        require('../../assets/cars/auddi-a6.jpg'),
  'tkm-xbov':        require('../../assets/cars/tkm-xbov.jpg'),
  'alfo-julia':      require('../../assets/cars/alfo-julia.jpg'),
  'dmw-m8':          require('../../assets/cars/dmw-m8.jpg'),
  'lezus-450':       require('../../assets/cars/lezus-450.jpg'),
  'genetic-c90':     require('../../assets/cars/genetic-c90.jpg'),
  'mercedes-gls':    require('../../assets/cars/mercedes-gls.jpg'),
  'porshe-cayman':   require('../../assets/cars/porshe-cayman.jpg'),
  'jaguar-xfr':      require('../../assets/cars/jaguar-xfr.jpg'),
  'volvio-s90':      require('../../assets/cars/volvio-s90.jpg'),

  // Premium — supercars & hypercars (8 cars)
  'ferarry-v60':     require('../../assets/cars/ferarry-v60.jpg'),
  'mercedes-exo':    require('../../assets/cars/mercedes-exo.jpg'),
  'macleran-b1':     require('../../assets/cars/macleran-b1.jpg'),
  'lambrogini-uros': require('../../assets/cars/lambrogini-uros.jpg'),
  'lambrogini-huri': require('../../assets/cars/lambrogini-huri.jpg'),
  'bugatii-chrion':  require('../../assets/cars/bugatii-chrion.jpg'),
  'aston-vantash':   require('../../assets/cars/aston-vantash.jpg'),
  'koenig-jetska':   require('../../assets/cars/koenig-jetska.jpg'),

  // Boats
  'ferarry-jet':     require('../../assets/cars/ferarry-jet.jpg'),
  'lezus-marine':    require('../../assets/cars/lezus-marine.jpg'),
  'dmw-cruiser':     require('../../assets/cars/dmw-cruiser.jpg'),
  'hondo-mariner':   require('../../assets/cars/hondo-mariner.jpg'),

  // Jets & yachts
  'boieng-7s':       require('../../assets/cars/boieng-7s.jpg'),
  'arrbus-exec':     require('../../assets/cars/arrbus-exec.jpg'),
  'cessna-sky':      require('../../assets/cars/cessna-sky.jpg'),
  'ferarry-yacht':   require('../../assets/cars/ferarry-yacht.jpg'),
  'mbych-yacht':     require('../../assets/cars/mbych-yacht.jpg'),
};

export function getCarImage(id: string): number | null {
  return CAR_IMAGES[id] ?? null;
}
